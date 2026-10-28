import { describe, expect, it } from "vitest";
import { interpolate } from "../src/interpolate.js";

describe("interpolate", () => {
  it("substitutes name and language slots", () => {
    expect(
      interpolate("# {{name}}\nLanguage: {{language}}", {
        name: "Ada",
        language: "English",
      }),
    ).toBe("# Ada\nLanguage: English");
  });

  it("substitutes repeated slots", () => {
    expect(interpolate("{{name}} and {{name}}", { name: "Ada" })).toBe(
      "Ada and Ada",
    );
  });

  it("leaves text without slots untouched", () => {
    expect(interpolate("plain text", { name: "Ada" })).toBe("plain text");
  });

  it("throws on an unknown slot", () => {
    expect(() => interpolate("{{nope}}", { name: "Ada" })).toThrow(
      "Unknown template slot: {{nope}}",
    );
  });
});
