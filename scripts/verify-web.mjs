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
    const text = message.text();
    if (!text.includes("Failed to load resource: the server responded with a status of 404")) {
      consoleErrors.push(text);
    }
  }
});
page.on("pageerror", (error) => {
  consoleErrors.push(error.message);
});

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
let state = await pageState(page);
assert(state.bodyLength > 200, "Landing page rendered too little content");
assert(!state.hasOverlay, "Error overlay detected on landing page");
assert(state.bodyBackground !== "rgba(0, 0, 0, 0)", "Global background CSS did not apply");

// Fill out the mini placement test
await page.getByRole("button", { name: "They reduce rainwater runoff and improve insulation." }).click();
await page.getByPlaceholder("e.g. In my opinion, digital", { exact: false }).fill("In my opinion, digital devices can significantly improve education by offering instant access to information, provided they are managed well.");
await page.getByRole("button", { name: "Check My Score" }).click();

// Step 1: Name
await page.waitForURL("**/register/name");
await page.getByRole("textbox", { name: "Full Name" }).fill("Amina Rahman");
await page.getByRole("button", { name: "Next Step" }).click();

// Step 2: Class
await page.waitForURL("**/register/class");
await page.getByRole("button", { name: "Class 11" }).click();
await page.getByRole("button", { name: "Next Step" }).click();

// Step 3: About
await page.waitForURL("**/register/about");
await page.getByRole("textbox", { name: "About Me" }).fill("I want to study abroad and need a stronger IELTS Writing score.");
await page.getByRole("button", { name: "Reveal Results" }).click();

// Reveal screen
await page.waitForURL("**/register/reveal");
await page.getByRole("button", { name: "Go to Study Dashboard" }).click();

// Dashboard check
await page.waitForURL("**/dashboard");
await page.getByText("Predicted band", { exact: true }).waitFor();

await page.getByLabel("Ask Buddy").fill("Give me a writing plan");
await page.getByRole("button", { name: "Ask" }).click();
await page.getByText("For your 7.5 target", { exact: false }).waitFor();

await page.getByLabel("Primary", { exact: true }).getByRole("link", { name: "Practice" }).click();
await page.waitForURL("**/practice");
await page.getByRole("tab", { name: "Writing" }).click();
await page.getByRole("button", { name: "Grade with Gemini" }).click();
await page.getByText(/Gemini band|Mock band/).waitFor();

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
