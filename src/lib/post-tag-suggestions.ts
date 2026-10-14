const popularTags = [
  { tag: "community", keywords: ["community", "communities", "group", "groups", "connection", "connections", "discussion", "discussions", "conversation", "conversations"] },
  { tag: "photography", keywords: ["photo", "photos", "photograph", "photography", "camera", "picture", "pictures", "image", "images", "frame", "frames"] },
  { tag: "makers-lab", keywords: ["make", "makes", "making", "maker", "makers", "project", "projects", "work", "works", "creative", "creativity"] },
  { tag: "art", keywords: ["art", "artistic", "paint", "painting", "draw", "drawing", "illustration", "craft", "crafts"] },
  { tag: "technology", keywords: ["technology", "technologies", "tech", "software", "code", "coding", "tool", "tools"] },
  { tag: "open-source", keywords: ["open", "source", "opensource", "developer", "developers"] },
  { tag: "local-groups", keywords: ["local", "neighborhood", "neighbourhood", "neighbors", "neighbours"] },
] as const;

function tokenize(text: string) {
  return new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? []);
}

export function getPopularTagSuggestions(text: string, limit = 5): string[] {
  const words = tokenize(text);
  return popularTags
    .map(({ tag, keywords }, index) => ({
      tag,
      index,
      score: keywords.reduce((total, keyword) => total + Number(words.has(keyword)), 0)
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ tag }) => tag);
}
