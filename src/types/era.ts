export type EraType = 'palia' | 'pirate';

export interface EraConfig {
  id: EraType;
  name: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    mutedText: string;
    border: string;
  };
  fonts: {
    serif: string;
    sans: string;
  };
  assets: {
    petBase: string;
    icons: Record<string, any>;
  };
}
