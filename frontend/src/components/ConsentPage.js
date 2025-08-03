// ConsentPage.jsx
import React, { useState } from 'react';

const ConsentPage = ({ onConsentAccepted }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white p-8 rounded-lg shadow max-w-4xl w-full max-h-screen overflow-y-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Informed Consent</h1>

        {/* Consent Content Starts Here */}
        <div className="prose max-w-none text-sm text-gray-800 mb-6">
          <p>
            You are invited to participate in the online study <strong>"Gender-Related Differences in AI Prompting Behavior"</strong>.
            The study is conducted by Salman Younus, Ikbela Halili, Muhammad Usama, Aliza, and Muhammed Berat Kurt and supervised by Prof. Dr. Valentin Schwind from the Frankfurt University of Applied Sciences.
            The study with estimated 20 participants takes place from 2025-06-29 to 2025-09-29.
          </p>

          <ul className="list-disc pl-6 mt-4">
            <li>Your participation is entirely voluntary and can be discontinued at any time.</li>
            <li>One session of the online study will last approximately 15 minutes.</li>
            <li>You will receive one credit point for the lecture.</li>
            <li>
              We collect some personal information (e.g., age, gender), but contact data (e.g., email) will only be used for feedback or study information.
            </li>
            <li>We will log your input during the session.</li>
            <li>
              Data is stored pseudoanonymized and handled under GDPR regulations. Public datasets will not allow identification of individuals.
            </li>
          </ul>

          <strong><h2 className="mt-6">1. Purpose and Goal of this Research</h2></strong>
          <p>
            We aim to understand how gender influences the way users interact with AI systems. This research will improve fairness and inclusivity in AI-human interaction and may be presented in academic journals or conferences.
          </p>

          <strong><h2 className="mt-4">2. Study Participation</h2></strong>
          <p>
            You can refuse or withdraw at any time without penalty. You’ll still receive compensation if you discontinue. Repeated participation is not permitted.
          </p>

          <strong><h2 className="mt-4">3. Study Procedure</h2></strong>
          <ol className="list-decimal pl-6">
            <li>You will be introduced to a set of tasks and the AI assistant.</li>
            <li>You will perform tasks one by one.</li>
            <li>Continue each task until satisfied with the AI's response.</li>
            <li>Submit when finished with all tasks.</li>
            <li>Provide feedback at the end.</li>
          </ol>

          <strong><h2 className="mt-4">4. Risks and Benefits</h2></strong>
          <p>
            There are no immediate risks. As with any digital system, there's a small chance of data leakage. Your participation supports research in human-computer interaction.
          </p>

          <strong><h2 className="mt-4">5. Data Protection and Confidentiality</h2></strong>
          <p>
            All data collected is processed under GDPR. You may request access, correction, or deletion of your data. Anonymized data may be made public and cannot be withdrawn afterward. Contact information is confidential and only used for study purposes.
          </p>

          <strong><h2 className="mt-4">6. Contacts</h2></strong>
          <p>If you have questions, contact:</p>
          <ul className="list-disc pl-6">
            <li>Aliza – <a href="mailto:aliza.-@stud.fra-uas.de">aliza.-@stud.fra-uas.de</a></li>
            <li>Ikbela Halili – <a href="mailto:ikbela.halili@stud.fra-uas.de">ikbela.halili@stud.fra-uas.de</a></li>
            <li>Muhammad Usama – <a href="mailto:muhammad.usama@stud.fra-uas.de">muhammad.usama@stud.fra-uas.de</a></li>
            <li>Muhammed Berat Kurt – <a href="mailto:muhammed.kurt@stud.fra-uas.de">muhammed.kurt@stud.fra-uas.de</a></li>
            <li>Salman Younus – <a href="mailto:salman.younus@stud.fra-uas.de">salman.younus@stud.fra-uas.de</a></li>
            <li>Supervisor: Prof. Dr. Valentin Schwind – <a href="mailto:valentin.schwind@fb2.fra-uas.de">valentin.schwind@fb2.fra-uas.de</a></li>
          </ul>

        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-3 mb-6">
          <input
            type="checkbox"
            id="consentCheckbox"
            className="mt-1"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="consentCheckbox" className="text-sm text-gray-700">
            I have read and understood the informed consent document. I voluntarily agree to participate.
          </label>
        </div>

        <button
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={!checked}
          onClick={onConsentAccepted}
        >
          Continue to Registration
        </button>
      </div>
    </div>
  );
};

export default ConsentPage;
