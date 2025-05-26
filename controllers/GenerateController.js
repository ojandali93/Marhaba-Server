import openai from '../utils/open.js';
export const generateProfilePrompt = async (req, res) => {
  const { description, count = 1 } = req.body;

  if (count < 1 || count > 20) {
    return res.status(400).json({
      success: false,
      message: 'You can generate between 1 and 20 profiles at a time.',
    });
  }

  const promptBase = `
You are generating realistic, culturally aligned fake user profiles for an Arab dating app called Marhabah. Each profile must look authentic, culturally appropriate, and ready to be inserted into the production database. Use JSON formatting and fill in all relevant details.

Each profile should include these fields with values selected only from the allowed options (when applicable):

- phone
- name
- date_of_birth
- gender
- height (between 4’6’’ and 6’8’’)
- background (array of up to 2 countries)
- intentions: ['Friendship', 'Connect with Community', 'Something Serious', 'Marriage']
- timeline: ['As soon as possible', 'Within 6–12 months', 'In 1–2 years', 'In 3–5 years', 'Not sure yet', 'When the time feels right']
- importance_of_marriage: ['Extremely', 'Very', 'Somewhat', 'Not at all']
- marriage_status (optional): ['Single', 'In a Relationship', 'Married', 'Divorced', 'Widowed', 'Prefer not to say']
- long_distance: ['yes', 'no', 'maybe']
- relocate: ['yes', 'no', 'maybe']
- first_step (optional): ['Chat on app', 'Video call', 'Meet in person', 'Exchange numbers']
- family_involvement (optional): ['Immediately', 'After a few dates', 'Once serious', 'Not important']
- smoking: ['yes', 'no', 'sometimes']
- drinking: ['yes', 'no', 'sometimes']
- has_kids: ['yes', 'no']
- wants_kids: ['yes', 'no', 'wants kids']
- sleep (optional): ['Early Bird', 'Night Owl', 'Flexible']
- exercise (optional): ['Daily', 'Often', 'Sometimes', 'Rarely', 'Never']
- diet (optional): ['Halal', 'Vegan', 'Vegetarian', 'Pescetarian', 'Omnivore', 'Other']
- religion (single value)
- sect (single value)
- practices (optional): ['Very Practicing', 'Somewhat Practicing', 'Not Practicing', 'Prefer not to say']
- openness (optional): ['Must align', 'Open to other religions', 'Open to other sects', 'Open to other practices', 'Prefer not to say']
- building_a_family: ['Essential', 'Important', 'Neutral', 'Not Important']
- shared_faith: ['Essential', 'Important', 'Flexible', 'Not Important', 'Opposing Views']
- personal_ambition: ['Highly Ambitious', 'Moderately Ambitious', 'Low Ambition', 'Not A Priority', 'Still Exploring']
- career_vs_family: ['Career First', 'Family First', 'Balanced', 'Flexible', 'Career Options']
- conflict_style: ['Calm decisions', 'Tackle head on', 'Need space', 'Emotional expression', 'Avoid conflict']
- decision_making: ['Need space', 'Need to be close', 'Flexible', 'No preference']
- independence (optional): ['Lead the decision', 'collaborate equally', 'Let them decide', 'No preference']
- political_views (optional): ['Aligned with my views', 'Open to other views', 'No preference']
- communication_style (select 2): ['Direct & honest', 'Playful & teasing', 'Thoughtful & reflective', 'Light & humorous', 'Supportive & empathetic', 'Straight to the point']
- love_language (select 2): ['Words of Affirmation', 'Quality Time', 'Acts of Service', 'Physical Touch', 'Receiving Gifts']
- core_values (select 4): ['Loyalty', 'Ambition', 'Empathy', 'Faith', 'Honesty', 'Humor', 'Stability', 'Curiosity', 'Independence', 'Family']
- time_priorities (select 2): ['Family Time', 'Friend Time', 'Career / Work', 'Spiritual Growth', 'Alone / Recharge Time', 'Building Something New']
- current_job
- current_company
- industry (optional)
- work_site (optional): ['on site', 'remote', 'hybrid']
- education
- future_career_ambition: ['Very Ambitious', 'Balanced', 'Flexible', 'Simple Lifestyle', 'Other']
- future_financial_ambition: ['Very Ambitious', 'Balanced', 'Flexible', 'Simple Lifestyle', 'Other']
- pace_of_life (optional): ['Fast', 'Moderate', 'Slow', 'Flexible', 'Other']
- long_term_living (optional): ['Stay near family', 'Open to relocating', 'Desire to move abroad', 'No strong preference', 'Other']
- five_year_plan (optional)
- prompts (2–3 answered questions)
- traits_and_hobbies (3–5 things)
- pref_age_range
- pref_gender
- pref_distance
- pref_background
- pref_religion
- pref_sect (optional)
- pref_religion_views (optional)

Return only a **valid array of JSON objects**, one for each profile.
`;

  const customPrompt = description
    ? `Generate ${count} user profile(s) for: ${description}`
    : `Generate ${count} diverse user profiles of varying ages, genders, and Arab backgrounds.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      temperature: 0.85,
      messages: [
        {
          role: 'system',
          content: promptBase,
        },
        {
          role: 'user',
          content: customPrompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    let parsedProfiles = null;
    try {
      parsedProfiles = JSON.parse(content);
    } catch (err) {
      console.error('❌ Failed to parse JSON:', err);
      return res.status(500).json({ success: false, error: 'Invalid JSON output from GPT.' });
    }

    return res.status(200).json({
      success: true,
      count: parsedProfiles.length,
      profiles: parsedProfiles,
    });
  } catch (err) {
    console.error('❌ OpenAI Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate profiles.' });
  }
};
