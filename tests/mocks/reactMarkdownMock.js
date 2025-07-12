// Mock for react-markdown that just renders the children as plain text
module.exports = function ReactMarkdown({ children }) {
  return children;
};