export default function ErrorPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-destructive">Wait, something went wrong.</h1>
                <p className="mt-4 text-muted-foreground">Please try checking your credentials and try again.</p>
                <a href="/login" className="mt-6 inline-block font-medium text-primary hover:underline">
                    &larr; Go back to login
                </a>
            </div>
        </div>
    )
}
