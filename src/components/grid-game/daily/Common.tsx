const LINKS = [
    { href: '/grid-game/archive', text: 'archive' },
    { href: '/grid-game/daily', text: 'daily' },
]

export const CommonLinks = () => {
    const path = location.pathname

    return (
        <div className="row-center justify-center gap-8px">
            {LINKS.map(({ href, text }) => href === path ? (
                <a key={text} href="#">{text}</a>
            ) : (
                <a key={text} href={href}>{text}</a>
            ))}
        </div>
    )
}
