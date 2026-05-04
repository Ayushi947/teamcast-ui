import { Award, Globe, HeartHandshake } from 'lucide-react';

const values = [
  {
    title: 'Innovation',
    description:
      "We constantly push the boundaries of what's possible in hiring and team management.",
    icon: Award,
  },
  {
    title: 'Transparency',
    description:
      'We believe in being open and honest in all our dealings with clients and candidates.',
    icon: Globe,
  },
  {
    title: 'People First',
    description:
      'Our platform is built with a focus on human connection and meaningful relationships.',
    icon: HeartHandshake,
  },
];

export function AboutValuesSection() {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-foreground text-3xl font-bold sm:text-4xl">
            Our Values
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            The principles that guide everything we do
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-card relative rounded-lg p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="text-primary">
                <value.icon className="h-8 w-8" />
              </div>
              <h3 className="text-foreground mt-4 text-lg font-medium">
                {value.title}
              </h3>
              <p className="text-muted-foreground mt-2">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
