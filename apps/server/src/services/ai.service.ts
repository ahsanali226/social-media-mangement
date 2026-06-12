import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || 'demo-key',
});

interface GenerateOptions {
  prompt: string;
  platform: string;
  tone: string;
  maxLength?: number;
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  FACEBOOK: 'Facebook post: Can be longer-form, supports rich text, links, and hashtags. Engage with storytelling and questions.',
  TWITTER: 'Twitter/X tweet: Must be under 280 characters. Be concise, use hashtags sparingly (1-3), and make every word count.',
  PINTEREST: 'Pinterest pin description: Focus on keywords, inspiration, and actionable tips. Use 2-5 hashtags. Max 500 characters.',
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: 'Use a professional, authoritative tone. Be clear and informative.',
  casual: 'Use a casual, friendly tone. Be conversational and relatable.',
  humorous: 'Use humor and wit. Be entertaining while still conveying the message.',
  inspirational: 'Use an inspirational, motivating tone. Be uplifting and empowering.',
  educational: 'Use an educational, informative tone. Teach and provide value.',
};

export class AIService {
  static async generatePost(options: GenerateOptions) {
    const { prompt, platform, tone, maxLength } = options;

    const platformGuide = PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES.FACEBOOK;
    const toneGuide = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.professional;

    // If no API key, return a demo response
    if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY === 'sk-your-openai-key') {
      return this.getDemoResponse(prompt, platform, tone);
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a social media content expert. Generate engaging social media posts based on user prompts.

Guidelines:
- ${platformGuide}
- ${toneGuide}
- Include relevant hashtags at the end
- ${maxLength ? `Keep the post under ${maxLength} characters` : ''}
- Return ONLY the post content, nothing else. Put hashtags on a separate line at the end.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content || '';
      const { text, hashtags } = this.extractHashtags(content);

      return {
        content: text,
        hashtags,
        platform,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getDemoResponse(prompt, platform, tone);
    }
  }

  private static getDemoResponse(prompt: string, platform: string, tone: string) {
    const demos: Record<string, Record<string, string>> = {
      FACEBOOK: {
        professional: `🚀 ${prompt}\n\nWe're excited to share our latest insights on this topic. The landscape is evolving rapidly, and staying ahead means embracing innovation while maintaining our core values.\n\nWhat are your thoughts? Drop a comment below! 👇\n\n#Innovation #Growth #Business #Strategy`,
        casual: `Hey everyone! 👋\n\nSo we've been thinking about ${prompt} and honestly? It's pretty amazing! 🎉\n\nWho else is excited about this? Let us know in the comments! 💬\n\n#Awesome #Community #LetsGo`,
        humorous: `Plot twist: ${prompt} 😂\n\nIf you didn't see this coming, join the club. We're accepting new members daily. Coffee and existential crisis provided. ☕\n\nTag someone who needs to see this! 😄\n\n#Humor #PlotTwist #RelatableContent`,
        inspirational: `✨ "${prompt}"\n\nEvery great journey begins with a single step. Today, take that step. Embrace the challenge. Become the change you want to see.\n\nYou've got this! 💪\n\n#Inspiration #Motivation #BelieveInYourself`,
        educational: `📚 Did you know? ${prompt}\n\nHere are 3 key takeaways:\n1️⃣ Knowledge is power\n2️⃣ Continuous learning drives success\n3️⃣ Sharing knowledge multiplies its value\n\nSave this post for later! 🔖\n\n#Education #Learning #DidYouKnow`,
      },
      TWITTER: {
        professional: `${prompt} — Here's what the data shows us 📊\n\nThe key insight: adapt fast, execute faster.\n\n#Business #Innovation`,
        casual: `${prompt} 🔥\n\nNot gonna lie, this is pretty exciting! Who's with me? 🙋\n\n#LetsGo`,
        humorous: `Me: I should be productive\nAlso me: ${prompt} 😂\n\n#Relatable`,
        inspirational: `"${prompt}" ✨\n\nBelieve in the process. Trust the journey. 💪\n\n#Motivation`,
        educational: `TIL: ${prompt} 🧠\n\nThread incoming... 🧵\n\n#LearnSomethingNew`,
      },
      PINTEREST: {
        professional: `${prompt} | Professional Tips & Strategies for Success | Expert Guide 2025\n\n#Business #Strategy #ProfessionalDevelopment #Tips #Guide`,
        casual: `${prompt} ✨ Easy & Fun Ideas You'll Love | DIY Inspiration\n\n#Ideas #Inspiration #FunStuff #DIY #Creative`,
        humorous: `${prompt} 😄 Because Why Not? | Fun Finds & Laughs\n\n#Funny #Humor #FunFinds #LOL`,
        inspirational: `${prompt} 💫 Inspiring Ideas to Transform Your Day\n\n#Inspiration #Motivation #DreamBig #Goals #Transform`,
        educational: `${prompt} 📚 Complete Guide & Tutorial | Learn Step by Step\n\n#Education #Tutorial #HowTo #Guide #Learning`,
      },
    };

    const platformDemos = demos[platform] || demos.FACEBOOK;
    const content = platformDemos[tone] || platformDemos.professional;
    const { text, hashtags } = this.extractHashtags(content);

    return { content: text, hashtags, platform };
  }

  private static extractHashtags(text: string): { text: string; hashtags: string[] } {
    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex) || [];
    const cleanText = text.replace(/\n*(?:#\w+\s*)+$/, '').trim();
    return { text: cleanText, hashtags };
  }
}
