import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  BarChart2,
  MessageSquare,
  Share2,
  Smile,
  Sparkles,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = (
  { icon, title, description }: FeatureCardProps = {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: "Feature",
    description: "Feature description goes here.",
  },
) => {
  return (
    <Card className="bg-[#1A1A1A] border-none hover:scale-105 transition-transform duration-300 h-full">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-full bg-primary/10">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-[#BBBBBB]">{description}</p>
      </CardContent>
    </Card>
  );
};

const FeaturesGrid = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-[#6C63FF]" />,
      title: "Journaling",
      description:
        "Record your thoughts, feelings, and spiritual insights in a secure digital journal.",
    },
    {
      icon: <Smile className="h-8 w-8 text-[#6C63FF]" />,
      title: "Emotion Tracking",
      description:
        "Select from six emotions to categorize your entries and track your emotional journey.",
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-[#6C63FF]" />,
      title: "Bible Verses",
      description:
        "Receive contextual Bible verses based on your emotions and journal content.",
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-[#6C63FF]" />,
      title: "Statistics",
      description:
        "View insights about your journaling habits, emotion trends, and spiritual growth.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-[#6C63FF]" />,
      title: "AI Integration",
      description:
        "Experience AI-powered verse recommendations and journal insights.",
    },
    {
      icon: <Share2 className="h-8 w-8 text-[#6C63FF]" />,
      title: "Sharing",
      description:
        "Share inspirational verses with friends and family on social media.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#6C63FF] to-[#9C64FF] text-transparent bg-clip-text">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
