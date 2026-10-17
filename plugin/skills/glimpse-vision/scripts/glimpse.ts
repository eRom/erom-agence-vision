#!/usr/bin/env bun
// Envoie une vidéo ou une image à elorian/glimpse (OpenRouter) et imprime le rapport Markdown sur stdout.
// Les métadonnées (taille, transcodage, tokens, coût) partent sur stderr pour ne pas polluer le rapport.
//
// Usage : bun glimpse.ts <fichier> "<question ou symptôme>" [--mode e2e|free] [--effort low|medium|high]

import { parseArgs } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";
import { unlink } from "node:fs/promises";

const MODEL = "elorian/glimpse";
// Seuil sur le fichier brut : le base64 ajoute ~33 %, donc ~27 Mo sur le fil.
const MAX_RAW_MB = 20;
const REQUEST_TIMEOUT_MS = 300_000;

const MEDIA_TYPES: Record<string, { mime: string; kind: "video_url" | "image_url" }> = {
  ".mp4": { mime: "video/mp4", kind: "video_url" },
  ".webm": { mime: "video/webm", kind: "video_url" },
  ".mov": { mime: "video/quicktime", kind: "video_url" },
  ".png": { mime: "image/png", kind: "image_url" },
  ".jpg": { mime: "image/jpeg", kind: "image_url" },
  ".jpeg": { mime: "image/jpeg", kind: "image_url" },
  ".webp": { mime: "image/webp", kind: "image_url" },
};

const SYSTEM_PROMPTS = {
  e2e: `You are a frontend QA engine reviewing a recording of an automated end-to-end test (Playwright) or a manual screen capture.
Re-sample the critical transitions at higher frame rate and zoom into anomalous regions before concluding.
Write the report in French, in Markdown, for a coding agent that cannot see the video:
1. **Chronologie** - each visible user action and the UI reaction, with timestamps MM:SS.s.
2. **Anomalies** - layout shifts, z-index jumps, unstyled flashes, overflow or clipping, endless loading states, invisible overlays blocking clicks. Give the timestamp and screen region of each.
3. **Diagnostic probable** - which CSS property or rendering cycle most likely explains what is seen. Mark it as a hypothesis.
Describe only what is visible. If the video shows no anomaly, say so plainly instead of inventing one.`,
  free: `You are a precise visual analyst. Answer the user's question about the provided video or image in French, in Markdown.
Anchor every claim on what is visible, with timestamps MM:SS.s for videos. Quote on-screen text verbatim when it matters.
If something is unreadable or ambiguous, say so instead of guessing.`,
} as const;

type Mode = keyof typeof SYSTEM_PROMPTS;

function fail(message: string, code = 1): never {
  console.error(`glimpse: ${message}`);
  process.exit(code);
}

// Réencode une vidéo trop lourde : 1280 px max, 30 i/s, sans audio (le modèle ne lit pas le son).
async function shrinkVideo(source: string): Promise<string> {
  if (!Bun.which("ffmpeg")) {
    fail(`fichier > ${MAX_RAW_MB} Mo et ffmpeg absent : réduis la vidéo à la main (brew install ffmpeg).`);
  }
  const target = path.join(tmpdir(), `glimpse-${process.pid}.mp4`);
  const proc = Bun.spawn(
    ["ffmpeg", "-y", "-loglevel", "error", "-i", source,
      "-vf", "scale='min(1280,iw)':-2", "-r", "30", "-an",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", target],
    { stderr: "pipe" },
  );
  if ((await proc.exited) !== 0) {
    fail(`ffmpeg a échoué : ${await new Response(proc.stderr).text()}`);
  }
  return target;
}

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    mode: { type: "string", default: "free" },
    effort: { type: "string", default: "high" },
  },
  allowPositionals: true,
});

const [filePath, question] = positionals;
if (!filePath || !question) {
  fail('usage : bun glimpse.ts <fichier> "<question ou symptôme>" [--mode e2e|free] [--effort low|medium|high]', 2);
}
const mode = values.mode as Mode;
if (!(mode in SYSTEM_PROMPTS)) fail(`mode inconnu « ${values.mode} » (e2e ou free)`, 2);

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) fail("OPENROUTER_API_KEY absente de l'environnement.");

const source = path.resolve(filePath);
const file = Bun.file(source);
if (!(await file.exists())) fail(`fichier introuvable : ${source}`);

const media = MEDIA_TYPES[path.extname(source).toLowerCase()];
if (!media) fail(`format non supporté (${path.extname(source)}) : ${Object.keys(MEDIA_TYPES).join(", ")}`);

let uploadPath = source;
let uploadMime = media.mime;
const rawMb = file.size / 1024 / 1024;
if (rawMb > MAX_RAW_MB) {
  if (media.kind !== "video_url") fail(`image de ${rawMb.toFixed(1)} Mo, trop lourde : réduis-la.`);
  uploadPath = await shrinkVideo(source);
  uploadMime = "video/mp4";
  const shrunkMb = Bun.file(uploadPath).size / 1024 / 1024;
  console.error(`glimpse: transcodé ${rawMb.toFixed(1)} Mo -> ${shrunkMb.toFixed(1)} Mo`);
  if (shrunkMb > MAX_RAW_MB) fail(`encore ${shrunkMb.toFixed(1)} Mo après transcodage : découpe la vidéo.`);
}

try {
  const base64 = Buffer.from(await Bun.file(uploadPath).arrayBuffer()).toString("base64");
  const dataUrl = `data:${uploadMime};base64,${base64}`;
  const mediaPart = media.kind === "video_url"
    ? { type: "video_url", video_url: { url: dataUrl } }
    : { type: "image_url", image_url: { url: dataUrl } };

  const started = performance.now();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "erom-vision glimpse",
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning: { effort: values.effort },
      usage: { include: true },
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[mode] },
        { role: "user", content: [mediaPart, { type: "text", text: question }] },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) fail(`OpenRouter ${response.status} : ${await response.text()}`);

  const data = await response.json();
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) fail(`réponse vide : ${JSON.stringify(data).slice(0, 500)}`);

  const usage = data.usage ?? {};
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.error(
    `glimpse: ${seconds} s, ${usage.prompt_tokens ?? "?"} in / ${usage.completion_tokens ?? "?"} out, coût ${usage.cost ?? "?"} $`,
  );
  console.log(content);
} finally {
  if (uploadPath !== source) await unlink(uploadPath).catch(() => {});
}
