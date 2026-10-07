import Image from 'next/image';
import { Code2, ListChecks, PanelsTopLeft, TerminalSquare } from 'lucide-react';

const logos = {
  HTML5: 'html5',
  CSS3: 'css3',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  'React.js': 'react',
  'Next.js': 'nextjs',
  'Node.js': 'nodejs',
  'Express.js': 'express',
  MongoDB: 'mongodb',
  Mongoose: 'mongoose',
  PostgreSQL: 'postgresql',
  'Tailwind CSS': 'tailwindcss',
  'Chakra UI': 'chakraui',
  'Material UI': 'materialui',
  'Framer Motion': 'framermotion',
  Figma: 'figma',
  'Redux Toolkit': 'redux',
  'Context API': 'react',
  Axios: 'axios',
  Zod: 'zod',
  Git: 'git',
  GitHub: 'github',
  Docker: 'docker',
  Postman: 'postman',
  Vercel: 'vercel',
  Render: 'render',
  ESLint: 'eslint',
  Prettier: 'prettier',
  Stylelint: 'stylelint',
  Cursor: 'cursor',
};

const symbols = {
  'Rizz UI': PanelsTopLeft,
  Forms: ListChecks,
  'OpenAI Codex': TerminalSquare,
};

export default function TechnologyIcon({ name }) {
  const logo = logos[name];
  const Icon = symbols[name] || Code2;

  return (
    <span className="technology-icon" aria-hidden="true">
      {logo ? <Image src={`/icons/skills/${logo}.svg`} alt="" width={26} height={26} /> : <Icon size={24} strokeWidth={1.6} />}
    </span>
  );
}
