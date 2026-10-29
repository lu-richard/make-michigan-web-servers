const MAIZEY_URL = 'https://umgpt.umich.edu/maizey/fabnav';

function AskMaizey() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-2 p-4">
            {/* UMich login (Shibboleth) only allows framing from https://*.umich.edu, so the iframe won't load on localhost. */}
            <a href={MAIZEY_URL} target="_blank" rel="noopener noreferrer" className="self-end text-sm underline">
                Open Maizey in a new tab
            </a>
            <iframe src={MAIZEY_URL} title="Ask Maizey" className="w-full flex-1 rounded border-0" allow="clipboard-read; clipboard-write" />
        </div>
    );
}

export default AskMaizey;
