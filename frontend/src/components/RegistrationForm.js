import React, { useState } from 'react';
import Select from 'react-select'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { AiOutlineInfoCircle } from "react-icons/ai";


const RegistrationForm = ({ onRegistrationComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    email: '',
    age: '',
    gender: '',
    education: '',
    occupation: '',
    nationality: '',
    frequency_usage: '',
    english: '',
    usage: [],
    consent: false
  });

  const handleSubmit = async (e) => {
    if (formData.consent) {
      // Here you would typically send the formData to your backend or API
      e.preventDefault();
      const mappedData = {
        name: formData.fullName,
        password: formData.password,  // but hash it, seriously
        email: formData.email,
        age: Number(formData.age), // convert string to int
        gender: formData.gender,
        education: formData.education,
        occupation: formData.occupation,
        nationality: formData.nationality,
        frequency_usage: formData.frequency_usage,
        english_fluency: formData.english,
        ai_usage: formData.usage,
        consent: formData.consent,
      };
      try {
        const res = await axios.post('http://hmi-backend-env.eba-rrkbxtkb.eu-central-1.elasticbeanstalk.com/register', mappedData);
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        console.log(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert('Registration failed!');
      }
      // Call the callback to notify parent component
      onRegistrationComplete(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Research Study Registration
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div className="relative">
            <div className="flex items-center gap-1 mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative group cursor-pointer">
                <AiOutlineInfoCircle className="text-blue-500" size={16} />
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-72 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  If you are enrolled in Schwind: HMI - SoSe 2025, please enter your University email address to get 1 CR.
                </div>
              </div>
            </div>

            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>




          {/* <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Create Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                required
                min="18"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Others</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.education}
              onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="none">None</option>
              <option value="primary-school">Primary School</option>
              <option value="secondary-school">Secondary School</option>
              <option value="post-secondary">Post-secondary School Diploma / High School Diploma</option>
              <option value="vocational">Completed Vocational Training</option>
              <option value="university">Completed University Studies</option>
              <option value="doctoral">Doctoral Degree</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.occupation}
              onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="none">None</option>
              <option value="management">Management</option>
              <option value="natural-sciences">Natural Sciences</option>
              <option value="engineering">Engineering</option>
              <option value="health">Health</option>
              <option value="law-order">Law and Order</option>
              <option value="clerical">Clerical</option>
              <option value="spiritual">Spiritual</option>
              <option value="social">Social</option>
              <option value="humanities">Humanities</option>
              <option value="services-sales">Services and Sales</option>
              <option value="agri-food">Agriculture and Food</option>
              <option value="craft">Craft</option>
              <option value="military">Military</option>
              <option value="computing">Computing</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.nationality}
              onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="afghanistan">Afghanistan</option>
              <option value="akrotiri">Akrotiri</option>
              <option value="albania">Albania</option>
              <option value="algeria">Algeria</option>
              <option value="american">American</option>
              <option value="andorra">Andorra</option>
              <option value="angola">Angola</option>
              <option value="anguilla">Anguilla</option>
              <option value="antarctica">Antarctica</option>
              <option value="antigua">Antigua</option>
              <option value="argentina">Argentina</option>
              <option value="armenia">Armenia</option>
              <option value="aruba">Aruba</option>
              <option value="ashmore">Ashmore</option>
              <option value="australia">Australia</option>
              <option value="austria">Austria</option>
              <option value="azerbaijan">Azerbaijan</option>
              <option value="bahamas">Bahamas</option>
              <option value="bahrain">Bahrain</option>
              <option value="bangladesh">Bangladesh</option>
              <option value="barbados">Barbados</option>
              <option value="bassas">Bassas</option>
              <option value="belarus">Belarus</option>
              <option value="belgium">Belgium</option>
              <option value="belize">Belize</option>
              <option value="benin">Benin</option>
              <option value="bermuda">Bermuda</option>
              <option value="bhutan">Bhutan</option>
              <option value="bolivia">Bolivia</option>
              <option value="bosnia">Bosnia</option>
              <option value="botswana">Botswana</option>
              <option value="bouvet">Bouvet</option>
              <option value="brazil">Brazil</option>
              <option value="british">British</option>
              <option value="brunei">Brunei</option>
              <option value="bulgaria">Bulgaria</option>
              <option value="burkina">Burkina</option>
              <option value="burma">Burma</option>
              <option value="burundi">Burundi</option>
              <option value="cambodia">Cambodia</option>
              <option value="cameroon">Cameroon</option>
              <option value="canada">Canada</option>
              <option value="cape">Cape</option>
              <option value="cayman">Cayman</option>
              <option value="central">Central</option>
              <option value="chad">Chad</option>
              <option value="chile">Chile</option>
              <option value="china">China</option>
              <option value="christmas">Christmas</option>
              <option value="clipperton">Clipperton</option>
              <option value="cocos">Cocos</option>
              <option value="colombia">Colombia</option>
              <option value="comoros">Comoros</option>
              <option value="congo">Congo</option>
              <option value="cook">Cook</option>
              <option value="coral">Coral</option>
              <option value="costa">Costa</option>
              <option value="cote">Cote</option>
              <option value="croatia">Croatia</option>
              <option value="cuba">Cuba</option>
              <option value="cyprus">Cyprus</option>
              <option value="czech">Czech</option>
              <option value="denmark">Denmark</option>
              <option value="dhekelia">Dhekelia</option>
              <option value="djibouti">Djibouti</option>
              <option value="dominica">Dominica</option>
              <option value="dominican">Dominican</option>
              <option value="ecuador">Ecuador</option>
              <option value="egypt">Egypt</option>
              <option value="el">El</option>
              <option value="equatorial">Equatorial</option>
              <option value="eritrea">Eritrea</option>
              <option value="estonia">Estonia</option>
              <option value="ethiopia">Ethiopia</option>
              <option value="europa">Europa</option>
              <option value="falkland">Falkland</option>
              <option value="faroe">Faroe</option>
              <option value="fiji">Fiji</option>
              <option value="finland">Finland</option>
              <option value="france">France</option>
              <option value="french">French</option>
              <option value="gabon">Gabon</option>
              <option value="gambia">Gambia</option>
              <option value="gaza">Gaza</option>
              <option value="georgia">Georgia</option>
              <option value="germany">Germany</option>
              <option value="ghana">Ghana</option>
              <option value="gibraltar">Gibraltar</option>
              <option value="glorioso">Glorioso</option>
              <option value="greece">Greece</option>
              <option value="greenland">Greenland</option>
              <option value="grenada">Grenada</option>
              <option value="guadeloupe">Guadeloupe</option>
              <option value="guam">Guam</option>
              <option value="guatemala">Guatemala</option>
              <option value="guernsey">Guernsey</option>
              <option value="guinea">Guinea</option>
              <option value="guinea-bissau">Guinea-Bissau</option>
              <option value="guyana">Guyana</option>
              <option value="haiti">Haiti</option>
              <option value="heard">Heard</option>
              <option value="holy">Holy</option>
              <option value="honduras">Honduras</option>
              <option value="hong">Hong</option>
              <option value="hungary">Hungary</option>
              <option value="iceland">Iceland</option>
              <option value="india">India</option>
              <option value="indonesia">Indonesia</option>
              <option value="iran">Iran</option>
              <option value="iraq">Iraq</option>
              <option value="ireland">Ireland</option>
              <option value="isle">Isle</option>
              <option value="israel">Israel</option>
              <option value="italy">Italy</option>
              <option value="jamaica">Jamaica</option>
              <option value="jan">Jan</option>
              <option value="japan">Japan</option>
              <option value="jersey">Jersey</option>
              <option value="jordan">Jordan</option>
              <option value="juan">Juan</option>
              <option value="kazakhstan">Kazakhstan</option>
              <option value="kenya">Kenya</option>
              <option value="kiribati">Kiribati</option>
              <option value="korea">Korea</option>
              <option value="kuwait">Kuwait</option>
              <option value="kyrgyzstan">Kyrgyzstan</option>
              <option value="laos">Laos</option>
              <option value="latvia">Latvia</option>
              <option value="lebanon">Lebanon</option>
              <option value="lesotho">Lesotho</option>
              <option value="liberia">Liberia</option>
              <option value="libya">Libya</option>
              <option value="liechtenstein">Liechtenstein</option>
              <option value="lithuania">Lithuania</option>
              <option value="luxembourg">Luxembourg</option>
              <option value="macau">Macau</option>
              <option value="macedonia">Macedonia</option>
              <option value="madagascar">Madagascar</option>
              <option value="malawi">Malawi</option>
              <option value="malaysia">Malaysia</option>
              <option value="maldives">Maldives</option>
              <option value="mali">Mali</option>
              <option value="malta">Malta</option>
              <option value="marshall">Marshall</option>
              <option value="martinique">Martinique</option>
              <option value="mauritania">Mauritania</option>
              <option value="mauritius">Mauritius</option>
              <option value="mayotte">Mayotte</option>
              <option value="mexico">Mexico</option>
              <option value="micronesia">Micronesia</option>
              <option value="moldova">Moldova</option>
              <option value="monaco">Monaco</option>
              <option value="mongolia">Mongolia</option>
              <option value="montserrat">Montserrat</option>
              <option value="morocco">Morocco</option>
              <option value="mozambique">Mozambique</option>
              <option value="namibia">Namibia</option>
              <option value="nauru">Nauru</option>
              <option value="navassa">Navassa</option>
              <option value="nepal">Nepal</option>
              <option value="netherlands">Netherlands</option>
              <option value="new">New</option>
              <option value="nicaragua">Nicaragua</option>
              <option value="niger">Niger</option>
              <option value="nigeria">Nigeria</option>
              <option value="niue">Niue</option>
              <option value="norfolk">Norfolk</option>
              <option value="northern">Northern</option>
              <option value="norway">Norway</option>
              <option value="oman">Oman</option>
              <option value="pakistan">Pakistan</option>
              <option value="palau">Palau</option>
              <option value="panama">Panama</option>
              <option value="papua">Papua</option>
              <option value="paracel">Paracel</option>
              <option value="paraguay">Paraguay</option>
              <option value="peru">Peru</option>
              <option value="philippines">Philippines</option>
              <option value="pitcairn">Pitcairn</option>
              <option value="poland">Poland</option>
              <option value="portugal">Portugal</option>
              <option value="puerto">Puerto</option>
              <option value="qatar">Qatar</option>
              <option value="reunion">Reunion</option>
              <option value="romania">Romania</option>
              <option value="russia">Russia</option>
              <option value="rwanda">Rwanda</option>
              <option value="saint">Saint</option>
              <option value="samoa">Samoa</option>
              <option value="san">San</option>
              <option value="sao">Sao</option>
              <option value="saudi">Saudi</option>
              <option value="senegal">Senegal</option>
              <option value="serbia">Serbia</option>
              <option value="seychelles">Seychelles</option>
              <option value="sierra">Sierra</option>
              <option value="singapore">Singapore</option>
              <option value="slovakia">Slovakia</option>
              <option value="slovenia">Slovenia</option>
              <option value="solomon">Solomon</option>
              <option value="somalia">Somalia</option>
              <option value="south">South</option>
              <option value="spain">Spain</option>
              <option value="spratly">Spratly</option>
              <option value="sri">Sri</option>
              <option value="sudan">Sudan</option>
              <option value="suriname">Suriname</option>
              <option value="svalbard">Svalbard</option>
              <option value="swaziland">Swaziland</option>
              <option value="sweden">Sweden</option>
              <option value="switzerland">Switzerland</option>
              <option value="syria">Syria</option>
              <option value="taiwan">Taiwan</option>
              <option value="tajikistan">Tajikistan</option>
              <option value="tanzania">Tanzania</option>
              <option value="thailand">Thailand</option>
              <option value="timor-leste">Timor-Leste</option>
              <option value="togo">Togo</option>
              <option value="tokelau">Tokelau</option>
              <option value="tonga">Tonga</option>
              <option value="trinidad">Trinidad</option>
              <option value="tromelin">Tromelin</option>
              <option value="tunisia">Tunisia</option>
              <option value="turkey">Turkey</option>
              <option value="turkmenistan">Turkmenistan</option>
              <option value="turks">Turks</option>
              <option value="tuvalu">Tuvalu</option>
              <option value="uganda">Uganda</option>
              <option value="ukraine">Ukraine</option>
              <option value="united">United</option>
              <option value="uruguay">Uruguay</option>
              <option value="uzbekistan">Uzbekistan</option>
              <option value="vanuatu">Vanuatu</option>
              <option value="venezuela">Venezuela</option>
              <option value="vietnam">Vietnam</option>
              <option value="virgin">Virgin</option>
              <option value="wake">Wake</option>
              <option value="wallis">Wallis</option>
              <option value="west">West</option>
              <option value="western">Western</option>
              <option value="yemen">Yemen</option>
              <option value="zambia">Zambia</option>
              <option value="zimbabwe">Zimbabwe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How often do you use AI systems?</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.frequency_usage}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency_usage: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="never">Never</option>
              <option value="rarely">Rarely (less than once a week)</option>
              <option value="occasionally">Occasionally (1-3 times a week)</option>
              <option value="often">Often (4-6 times a week)</option>
              <option value="always">Always (daily)</option>
              <option value="multiple-times">Multiple times a day</option>
              <option value="constantly">Constantly (almost every hour)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How fluent are you in English?</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.english}
              onChange={(e) => setFormData(prev => ({ ...prev, english: e.target.value }))}
            >
              <option value="">Select...</option>
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="intermediate">Intermediate</option>
              <option value="beginner">Beginner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">What do you use AI for?</label>
            <Select
              isMulti
              options={[
                { value: 'work', label: 'Work (e.g. writing, coding)' },
                { value: 'teaching', label: 'Teaching' },
                { value: 'learning', label: 'Learning / Studying' },
                { value: 'research', label: 'Research / Information Gathering' },
                { value: 'writing', label: 'Writing (e.g. essays, blogs, reports)' },
                { value: 'chatting', label: 'Chatting for fun' },
                { value: 'generating-images', label: 'Generating Images / Art' },
                { value: 'planning', label: 'Planning (e.g. travel, events)' },
                { value: 'email', label: 'Writing Emails / Communication' },
                { value: 'summarizing', label: 'Summarizing Content' },
                { value: 'translation', label: 'Translation / Language Help' },
                { value: 'entertainment', label: 'Entertainment (e.g. jokes, stories, games)' },
                { value: 'coding', label: 'Coding / Debugging' },
                { value: 'others', label: 'Other' },
              ]}
              value={formData.usage} // formData.usage must be an array of selected options (objects)
              onChange={(selected) => setFormData(prev => ({ ...prev, usage: selected || [] }))}
              className="w-full"
              classNamePrefix="react-select"
              placeholder="Select..."
            />
          </div>

          <div className="flex items-start space-x-3 pt-4">
            <input
              type="checkbox"
              id="consent"
              required
              className="mt-1"
              checked={formData.consent}
              onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I have read and understood the informed consent information on the previous page. I voluntarily agree to participate in this research study.
            </label>
          </div>

          <button
            type="button"
            disabled={!formData.consent || !formData.fullName || !formData.email || !formData.age || !formData.gender || !formData.education || !formData.occupation || !formData.english || !formData.usage.length}
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Begin Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;