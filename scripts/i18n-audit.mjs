import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const srcDir = join(root, "src");
const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/;
const filePattern = /\.(ts|tsx)$/;

const ignoredPathParts = [
  "src/locales/",
  "src/app/api/",
  "src/constants/banks.ts",
];

const allowedVietnameseFragments = [
  "Menu Việt",
  "đ</",
  "đ ",
  "? \"đ\"",
];

const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!filePattern.test(fullPath)) continue;

    const rel = relative(root, fullPath).replaceAll("\\", "/");
    if (ignoredPathParts.some((part) => rel.startsWith(part) || rel === part)) continue;

    const lines = readFileSync(fullPath, "utf8").split("\n");
    lines.forEach((line, index) => inspectLine(rel, index + 1, line));
  }
}

function inspectLine(file, lineNumber, line) {
  const trimmed = line.trim();
  if (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("import ")
  ) {
    return;
  }

  const isAllowed = allowedVietnameseFragments.some((fragment) => line.includes(fragment));

  if (
    /language === "vi"\s*\?\s*"/.test(line) &&
    !line.includes("? \"đ\"") &&
    !line.includes("\"vi-VN\"")
  ) {
    findings.push({ file, lineNumber, reason: "language ternary string", text: trimmed });
    return;
  }

  if (isAllowed || !vietnamesePattern.test(line)) return;

  const hasHardcodedJsxText = />[^<{]*[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ][^<{]*</.test(line);
  const hasHardcodedAttribute = /\b(placeholder|title|aria-label)="[^"]*[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ][^"]*"/.test(line);

  if (hasHardcodedJsxText || hasHardcodedAttribute) {
    findings.push({ file, lineNumber, reason: "hard-coded Vietnamese UI text", text: trimmed });
  }
}

walk(srcDir);

if (findings.length > 0) {
  console.error("i18n audit found possible hard-coded UI text:\n");
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.lineNumber} [${finding.reason}] ${finding.text}`);
  }
  process.exit(1);
}

console.log("i18n audit passed: no high-risk hard-coded UI text found.");
