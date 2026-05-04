export function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden py-20 pt-40">
      <div className="bg-muted absolute inset-0 bg-gradient-to-br" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            About Teamcast.ai
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-md text-base sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            We&apos;re on a mission to revolutionize how teams are built and
            managed. Through cutting-edge AI technology and deep understanding
            of human dynamics, we help companies find and nurture the perfect
            candidate. Our platform transforms hiring with intelligent matching
            and data-driven insights.
          </p>
        </div>
      </div>
    </section>
  );
}
