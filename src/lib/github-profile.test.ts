import { describe, expect, it } from "vitest";

import { parseGithubUsername } from "@/lib/github-profile";

describe("parseGithubUsername", () => {
  it("accepts a bare username", () => {
    expect(parseGithubUsername("octocat")).toBe("octocat");
    expect(parseGithubUsername("  octocat  ")).toBe("octocat");
    expect(parseGithubUsername("my-user-123")).toBe("my-user-123");
  });

  it("extracts the username from profile links", () => {
    expect(parseGithubUsername("https://github.com/octocat")).toBe("octocat");
    expect(parseGithubUsername("https://www.github.com/octocat/")).toBe("octocat");
    expect(parseGithubUsername("github.com/octocat")).toBe("octocat");
    expect(parseGithubUsername("http://github.com/octocat?tab=repositories")).toBe("octocat");
  });

  it("takes the owner from a repository link", () => {
    expect(parseGithubUsername("https://github.com/octocat/hello-world")).toBe("octocat");
  });

  it("rejects links from other hosts", () => {
    expect(parseGithubUsername("https://gitlab.com/octocat")).toBeNull();
    expect(parseGithubUsername("https://github.com.evil.com/octocat")).toBeNull();
    expect(parseGithubUsername("https://notgithub.com/octocat")).toBeNull();
  });

  it("rejects invalid usernames", () => {
    expect(parseGithubUsername("")).toBeNull();
    expect(parseGithubUsername("   ")).toBeNull();
    expect(parseGithubUsername("-octocat")).toBeNull();
    expect(parseGithubUsername("octocat-")).toBeNull();
    expect(parseGithubUsername("octo--cat")).toBeNull();
    expect(parseGithubUsername("octo cat")).toBeNull();
    expect(parseGithubUsername("a".repeat(40))).toBeNull();
    expect(parseGithubUsername("https://github.com/")).toBeNull();
  });
});
