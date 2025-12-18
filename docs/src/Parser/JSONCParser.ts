export function parseJSONC(textContent: string) {
  const cleanedContent = textContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])/g, "");
  return JSON.parse(cleanedContent);
}
