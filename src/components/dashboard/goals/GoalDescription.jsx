import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { safeGoalLink } from '@/lib/goals';

const plugins = [remarkGfm];
const allowed = ['p', 'strong', 'em', 'del', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'input'];

export default function GoalDescription({ text, format = 'markdown', compact = false }) {
  if (!text) return <p className="bk-goal-description-empty">No description yet. Add the details that matter.</p>;
  if (format !== 'markdown') return <div className="bk-goal-rich-text is-plain">{text}</div>;
  return (
    <div className="bk-goal-rich-text">
      <Markdown remarkPlugins={plugins} skipHtml allowedElements={allowed} unwrapDisallowed urlTransform={safeGoalLink} components={{
        a: ({ href, children, title }) => href ? <a href={href} title={title} target="_blank" rel="noopener noreferrer" tabIndex={compact ? -1 : undefined}>{children}</a> : <span>{children}</span>,
        h1: ({ children }) => <h4>{children}</h4>, h2: ({ children }) => <h4>{children}</h4>, h3: ({ children }) => <h4>{children}</h4>,
        h4: ({ children }) => <h4>{children}</h4>, h5: ({ children }) => <h5>{children}</h5>, h6: ({ children }) => <h5>{children}</h5>,
      }}>{text}</Markdown>
    </div>
  );
}
