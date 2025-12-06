export function parseJSONC(textContent) {
  const cleanedContent = textContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*(?=[\n\r])/g, "");
  return JSON.parse(cleanedContent);
}
