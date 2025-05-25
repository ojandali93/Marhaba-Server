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

Each profile should include:

- phone
- name
- date_of_birth
- gender
- height
- background
- intentions
- timeline
- importance_of_marriage
- marriage_status (optional)
- long_distance
- relocate
- first_step (optional)
- family_involvement (optional)
- smoking
- drinking
- has_kids
- wants_kids
- sleep (optional)
- exercise (optional)
- diet (optional)
- religion
- sect
- practices (optional)
- openness (optional)
- building_a_family
- shared_faith
- personal_ambition
- career_vs_family
- conflict_style
- decision_making
- independence (optional)
- political_views (optional)
- communication_style
- love_language
- core_values
- time_priorities
- current_job
- current_company
- industry (optional)
- work_site (optional)
- relocate (optional)
- education
- career_ambition
- financial_ambition
- pace_of_life (optional)
- long_term_living (optional)
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
