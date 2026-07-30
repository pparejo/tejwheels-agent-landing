import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const publicRoot = join(projectRoot, "public");

const assets = [
  {
    output: "assets/logo.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Logo-personalizado-Tejwheels.png",
  },
  {
    output: "assets/favicon.png",
    url: "https://tejwheels.com/wp-content/uploads/2026/02/cropped-Favicon-TW-192x192.png",
  },
  {
    output: "assets/manufacturing.jpg",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Learn-manufacturing-963x1024.jpg",
  },
  {
    output: "assets/factory.jpg",
    url: "https://tejwheels.com/wp-content/uploads/2019/11/TEJWHEELS022.jpg",
  },
  {
    output: "assets/world.jpg",
    url: "https://tejwheels.com/wp-content/uploads/2025/12/TEJWHEELS-EN-TODO-EL-MUNDO-scaled.jpg",
  },
  {
    output: "assets/cataforesis.jpg",
    url: "https://tejwheels.com/wp-content/uploads/2020/06/TejWheels_0516.jpg",
  },
  {
    output: "assets/products/disco-fijo.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Rueda-disco-fijo.png",
  },
  {
    output: "assets/products/con-coronas.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Ruedas-variables-con-corona-frontal.png",
  },
  {
    output: "assets/products/multifit.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Ruedas-variables-multifit-frontal.png",
  },
  {
    output: "assets/products/flotacion.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Flotacion-y-remolque-frontal.png",
  },
  {
    output: "assets/products/aro-agricola.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Ruedas-de-aros-disco-fijo-frontal.png",
  },
  {
    output: "assets/products/industrial.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Ruedas-de-aros-para-industriales-frontal.png",
  },
  {
    output: "assets/products/separadores.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Separador-dual-simetrico.png",
  },
  {
    output: "assets/products/remolque.png",
    url: "https://tejwheels.com/wp-content/uploads/2025/11/Ruedas-estandar-para-remolque-agricola-frontal.png",
  },
  {
    output: "assets/media/disco-fijo.jpg",
    url: "https://i.ytimg.com/vi/-JlsK9XktC4/hqdefault.jpg",
  },
  {
    output: "assets/media/buje-ataque.jpg",
    url: "https://i.ytimg.com/vi/gPBmJMicFL8/hqdefault.jpg",
  },
  {
    output: "assets/media/ancho-via.jpg",
    url: "https://i.ytimg.com/vi/2m2fmrV8hlM/hqdefault.jpg",
  },
  {
    output: "assets/media/eje.jpg",
    url: "https://i.ytimg.com/vi/Ijk5Nw6We5w/hqdefault.jpg",
  },
];

async function download(url, outputPath) {
  const response = await fetch(url, {
    headers: { "user-agent": "TEJ-Wheels-Landing-Content-Sync/1.0" },
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar ${url}: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
  process.stdout.write(`✓ ${outputPath.replace(`${projectRoot}/`, "")}\n`);
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} terminó con código ${code}`));
    });
  });
}

async function syncHeroVideo() {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "tejwheels-landing-"));
  const sourcePath = join(temporaryDirectory, "hero-source.mp4");
  const videoPath = join(publicRoot, "assets", "hero.mp4");
  const posterPath = join(publicRoot, "assets", "hero-poster.jpg");

  try {
    await download(
      "https://tejwheels.com/wp-content/uploads/2025/11/Video-Tejwheels-Home.mp4",
      sourcePath,
    );
    await mkdir(dirname(videoPath), { recursive: true });

    await run("ffmpeg", [
      "-y",
      "-i",
      sourcePath,
      "-vf",
      "scale=1280:-2",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "25",
      "-movflags",
      "+faststart",
      videoPath,
    ]);

    await run("ffmpeg", [
      "-y",
      "-ss",
      "3",
      "-i",
      sourcePath,
      "-frames:v",
      "1",
      "-vf",
      "scale=1600:-2",
      "-q:v",
      "3",
      posterPath,
    ]);

    process.stdout.write("✓ assets/hero.mp4 (optimizado)\n");
    process.stdout.write("✓ assets/hero-poster.jpg\n");
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function main() {
  process.stdout.write("Sincronizando recursos oficiales de TEJ Wheels…\n");
  await Promise.all(
    assets.map(({ output, url }) => download(url, join(publicRoot, output))),
  );
  await syncHeroVideo();
  process.stdout.write("Sincronización completada.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
