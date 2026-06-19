import { chromium } from "@playwright/test";

const baseUrl = process.env.VERIFY_URL ?? "http://localhost:8081";
const consoleErrors = [];

async function launchBrowser() {
  try {
    return await chromium.launch({ headless: true });
  } catch {
    return chromium.launch({ channel: "msedge", headless: true });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function pageState(page) {
  return page.evaluate(() => {
    const bodyText = document.body.innerText.trim();
    const main = document.querySelector("main");
    const firstPanel = document.querySelector("section, article, aside");
    const bodyStyles = window.getComputedStyle(document.body);
    const panelStyles = firstPanel ? window.getComputedStyle(firstPanel) : null;

    return {
      bodyLength: bodyText.length,
      bodyPreview: bodyText.slice(0, 180),
      hasOverlay: Boolean(document.querySelector("[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay")),
      mainDisplay: main ? window.getComputedStyle(main).display : "",
      bodyBackground: bodyStyles.backgroundColor,
      panelRadius: panelStyles?.borderRadius ?? ""
    };
  });
}

const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});
page.on("pageerror", (error) => {
  consoleErrors.push(error.message);
});

await page.goto(`${baseUrl}/register`, { waitUntil: "networkidle" });
let state = await pageState(page);
assert(state.bodyLength > 200, "Register page rendered too little content");
assert(!state.hasOverlay, "Error overlay detected on register page");
assert(state.bodyBackground !== "rgba(0, 0, 0, 0)", "Global background CSS did not apply");

await page.getByRole("button", { name: "Continue to diagnostic" }).click();
await page.waitForURL("**/diagnostic");
await page.getByText("Diagnostic Test", { exact: true }).waitFor();

await page.getByRole("button", { name: "Open dashboard" }).click();
await page.waitForURL("**/dashboard");
await page.getByText("Predicted band", { exact: true }).waitFor();

await page.getByLabel("Ask Buddy").fill("Give me a writing plan");
await page.getByRole("button", { name: "Ask" }).click();
await page.getByText("For your 7.5 target", { exact: false }).waitFor();

await page.getByLabel("Primary", { exact: true }).getByRole("link", { name: "Practice" }).click();
await page.waitForURL("**/practice");
await page.getByRole("tab", { name: "Writing" }).click();
await page.getByRole("button", { name: "Grade with Buddy" }).click();
await page.getByText("Simulated band", { exact: true }).waitFor();

const desktopShot = await page.screenshot({ fullPage: false });
assert(desktopShot.length > 20_000, "Desktop screenshot unexpectedly small");

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${baseUrl}/dashboard`, { waitUntil: "networkidle" });
state = await pageState(page);
assert(state.bodyLength > 200, "Mobile dashboard rendered too little content");
assert(!state.hasOverlay, "Error overlay detected on mobile dashboard");
await page.getByLabel("Mobile primary").waitFor();
const mobileShot = await page.screenshot({ fullPage: false });
assert(mobileShot.length > 20_000, "Mobile screenshot unexpectedly small");

await browser.close();

if (consoleErrors.length > 0) {
  throw new Error(`Console errors detected: ${consoleErrors.join(" | ")}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checked: ["register", "diagnostic", "dashboard buddy chat", "practice writing grading", "mobile navigation"],
      desktopScreenshotBytes: desktopShot.length,
      mobileScreenshotBytes: mobileShot.length,
      finalPreview: state.bodyPreview
    },
    null,
    2
  )
);
