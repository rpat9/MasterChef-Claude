import ReactMarkdown from "react-markdown"

export default function(props){
    return(
        <section className="p-6 bg-white shadow-md rounded-2xl max-w-3xl mx-auto mt-8 border border-gray-200" aria-live="polite">
          <h2 className="text-2xl font-semibold mb-3 mt-1">MasterChef Claude Recommends: </h2>
            <ReactMarkdown className="prose prose-slate max-w-none"
            components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl font-bold mb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-semibold mb-3 mt-6" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-base leading-relaxed" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside pl-4 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 space-y-1 marker:font-bold" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="ml-2" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="italic" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                ),
              }}>
                    {props.recipe}
            </ReactMarkdown>
        </section>
    )
}