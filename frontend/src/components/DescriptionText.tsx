// Bullet style per nesting level; deeper levels reuse the last one.
const LIST_STYLES = ["list-disc", "list-[circle]", "list-[square]"];
const SPACES_PER_LEVEL = 4;

interface BulletItem {
    text: string;
    children: BulletItem[];
}

function parseBullets(lines: string[]): BulletItem[] {
    const root: BulletItem[] = [];
    // The list that a bullet at each depth belongs to.
    const listsByDepth: BulletItem[][] = [root];

    for (const line of lines) {
        const indent = line.length - line.trimStart().length;
        const depth = Math.min(Math.floor(indent / SPACES_PER_LEVEL), listsByDepth.length - 1);
        const item: BulletItem = { text: line.trim().slice(2), children: [] };

        listsByDepth[depth].push(item);
        listsByDepth.length = depth + 1;
        listsByDepth.push(item.children);
    }

    return root;
}

function BulletList({ items, depth = 0 }: { items: BulletItem[], depth?: number }) {
    return (
        <ul className={`pl-6 ${LIST_STYLES[Math.min(depth, LIST_STYLES.length - 1)]}`}>
            {
                items.map((item, index) =>
                    <li key={index} className="mt-1">
                        {item.text}
                        {item.children.length > 0 && <BulletList items={item.children} depth={depth + 1} />}
                    </li>
                )
            }
        </ul>
    );
}

// Renders text whose "- " lines (indented 4 spaces per level) are nested bullets; any other lines are plain paragraphs.
function DescriptionText({ text, className }: { text: string | null, className?: string }) {
    const blocks: { isList: boolean, lines: string[] }[] = [];

    for (const line of (text ?? "").split(/\r?\n/)) {
        if (line.trim() === "") {
            continue;
        }

        const isList = line.trimStart().startsWith("- ");
        const lastBlock = blocks[blocks.length - 1];

        if (isList && lastBlock?.isList) {
            lastBlock.lines.push(line);
        }
        else {
            blocks.push({ isList, lines: [line] });
        }
    }

    return (
        <div className={className}>
            {blocks.map((block, index) => block.isList ? <BulletList key={index} items={parseBullets(block.lines)} /> : <p key={index}>{block.lines[0]}</p>)}
        </div>
    );
}

export default DescriptionText;
