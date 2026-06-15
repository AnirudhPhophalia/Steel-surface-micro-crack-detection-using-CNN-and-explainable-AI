import { Cpu, Grid3x3, Eye } from 'lucide-react';

export function AboutSection() {
  const stages = [
    {
      icon: Cpu,
      title: 'Stage 1: ResNet18 Classifier',
      description:
        'Fast crack/no-crack binary filter. Processes the image in parallel on GPU.',
      timing: '4.93 ms',
    },
    {
      icon: Grid3x3,
      title: 'Stage 2: U-Net Segmentation',
      description:
        'Pixel-precise defect localization. Runs only when Stage 1 detects potential cracks.',
      timing: '5.10 ms',
    },
    {
      icon: Eye,
      title: 'XAI: Grad-CAM Explanations',
      description:
        'Operator can visualize which regions drove the model decision, enabling trust.',
      timing: 'Real-time',
    },
  ];

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold text-primary mb-6">
        Two-Stage Pipeline Architecture
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={idx}
              className="bg-card border border-border industrial-border p-6 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h3 className="font-semibold text-foreground">{stage.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{stage.description}</p>
              <p className="data-mono text-xs font-bold text-primary">
                {stage.timing}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
