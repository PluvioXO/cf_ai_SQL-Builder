import * as React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, language, className }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              style={style}
              className={cn(
                'p-4 overflow-x-auto text-sm font-mono rounded-lg',
                className
              )}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    );
  }
);
CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
