import pandas as pd
import numpy as np
import json
import re
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from wordcloud import WordCloud
import warnings
warnings.filterwarnings('ignore')

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')

class SentimentAnalyzer:
    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()
        self.stop_words = set(stopwords.words('english'))
        
    def load_data(self, messages_file, participants_file, tasks_file, interactions_file=None):
        """Load all data files"""
        self.messages_df = self.load_jsonl(messages_file)
        self.participants_df = self.load_jsonl(participants_file)
        self.tasks_df = self.load_jsonl(tasks_file)
        if interactions_file:
            self.interactions_df = self.load_jsonl(interactions_file)
        
    def load_jsonl(self, file_path):
        """Load JSONL file into DataFrame"""
        data = []
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                data.append(json.loads(line))
        return pd.DataFrame(data)
    
    def preprocess_text(self, text):
        """Clean and preprocess text"""
        if pd.isna(text) or text == '':
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove URLs, mentions, hashtags
        text = re.sub(r'http\S+|www\S+|@\w+|#\w+', '', text)
        
        # Remove special characters but keep spaces and punctuation for sentiment
        text = re.sub(r'[^\w\s.,!?;:]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def extract_linguistic_features(self, text):
        """Extract linguistic features for gender analysis"""
        if not text:
            return {}
        
        words = word_tokenize(text.lower())
        word_count = len(words)
        
        # Emotion words (basic emotion lexicon)
        emotion_words = {
            'positive': ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'great', 'excellent', 
                        'fantastic', 'awesome', 'perfect', 'beautiful', 'lovely', 'brilliant'],
            'negative': ['sad', 'angry', 'frustrated', 'terrible', 'awful', 'horrible', 
                        'disappointing', 'annoying', 'upset', 'worried', 'concerned'],
            'uncertainty': ['maybe', 'perhaps', 'possibly', 'might', 'could', 'uncertain', 
                           'unsure', 'seems', 'appears', 'probably'],
            'tentative': ['sort of', 'kind of', 'somewhat', 'rather', 'quite', 'fairly', 
                         'pretty much', 'I think', 'I guess', 'I suppose']
        }
        
        # Count emotion words
        emotion_counts = {}
        for emotion_type, word_list in emotion_words.items():
            count = sum(1 for word in words if any(ew in ' '.join(words) for ew in word_list))
            emotion_counts[f'{emotion_type}_words'] = count
        
        # Pronoun analysis
        pronouns = {
            'first_person': ['i', 'me', 'my', 'mine', 'myself'],
            'second_person': ['you', 'your', 'yours', 'yourself'],
            'third_person': ['he', 'she', 'him', 'her', 'his', 'hers', 'they', 'them', 'their']
        }
        
        pronoun_counts = {}
        for pronoun_type, pronoun_list in pronouns.items():
            count = sum(1 for word in words if word in pronoun_list)
            pronoun_counts[f'{pronoun_type}_pronouns'] = count
        
        # Other linguistic features
        sentence_count = len([s for s in text.split('.') if s.strip()])
        question_marks = text.count('?')
        exclamation_marks = text.count('!')
        
        features = {
            'word_count': word_count,
            'sentence_count': sentence_count if sentence_count > 0 else 1,
            'avg_sentence_length': word_count / max(sentence_count, 1),
            'question_marks': question_marks,
            'exclamation_marks': exclamation_marks,
            'question_ratio': question_marks / max(word_count, 1),
            'exclamation_ratio': exclamation_marks / max(word_count, 1),
        }
        
        features.update(emotion_counts)
        features.update(pronoun_counts)
        
        return features
    
    def analyze_sentiment_textblob(self, text):
        """Analyze sentiment using TextBlob"""
        if not text:
            return {'polarity': 0, 'subjectivity': 0}
        
        blob = TextBlob(text)
        return {
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity
        }
    
    def analyze_sentiment_vader(self, text):
        """Analyze sentiment using VADER"""
        if not text:
            return {'compound': 0, 'positive': 0, 'neutral': 0, 'negative': 0}
        
        scores = self.analyzer.polarity_scores(text)
        return {
            'compound': scores['compound'],
            'positive': scores['pos'],
            'neutral': scores['neu'],
            'negative': scores['neg']
        }
    
    def categorize_sentiment(self, compound_score):
        """Categorize sentiment based on VADER compound score"""
        if compound_score >= 0.05:
            return 'Positive'
        elif compound_score <= -0.05:
            return 'Negative'
        else:
            return 'Neutral'
    
    def analyze_all_messages(self):
        """Perform comprehensive sentiment analysis on all user messages"""
        # Filter for user messages only
        user_messages = self.messages_df[self.messages_df['sender'] == 'user'].copy()
        
        print(f"Analyzing {len(user_messages)} user messages...")
        
        # Preprocess text
        user_messages['cleaned_content'] = user_messages['content'].apply(self.preprocess_text)
        
        # Sentiment analysis
        textblob_results = user_messages['cleaned_content'].apply(self.analyze_sentiment_textblob)
        vader_results = user_messages['cleaned_content'].apply(self.analyze_sentiment_vader)
        
        # Extract sentiment scores
        user_messages['textblob_polarity'] = textblob_results.apply(lambda x: x['polarity'])
        user_messages['textblob_subjectivity'] = textblob_results.apply(lambda x: x['subjectivity'])
        
        user_messages['vader_compound'] = vader_results.apply(lambda x: x['compound'])
        user_messages['vader_positive'] = vader_results.apply(lambda x: x['positive'])
        user_messages['vader_neutral'] = vader_results.apply(lambda x: x['neutral'])
        user_messages['vader_negative'] = vader_results.apply(lambda x: x['negative'])
        
        user_messages['sentiment_category'] = user_messages['vader_compound'].apply(self.categorize_sentiment)
        
        # Extract linguistic features
        linguistic_features = user_messages['cleaned_content'].apply(self.extract_linguistic_features)
        linguistic_df = pd.json_normalize(linguistic_features)
        
        # Combine all results
        result_df = pd.concat([user_messages.reset_index(drop=True), linguistic_df], axis=1)
        
        return result_df
    
    def merge_with_participant_data(self, sentiment_df):
        """Merge sentiment analysis with participant demographic data"""
        # Get interaction data if available
        if hasattr(self, 'interactions_df'):
            # Merge with interactions to get participant_id
            sentiment_df = sentiment_df.merge(
                self.interactions_df[['id', 'participant_id']], 
                left_on='interaction_id', 
                right_on='id', 
                how='left',
                suffixes=('', '_interaction')
            )
        
        # Merge with participant data
        final_df = sentiment_df.merge(
            self.participants_df, 
            left_on='participant_id', 
            right_on='id', 
            how='left',
            suffixes=('', '_participant')
        )
        
        return final_df
    
    def generate_gender_comparison(self, df):
        """Generate comprehensive gender-based comparison"""
        if 'gender' not in df.columns:
            print("Gender information not available for comparison")
            return None
        
        # Group by gender
        gender_groups = df.groupby('gender')
        
        # Sentiment metrics
        sentiment_metrics = [
            'textblob_polarity', 'textblob_subjectivity',
            'vader_compound', 'vader_positive', 'vader_neutral', 'vader_negative'
        ]
        
        # Linguistic features
        linguistic_features = [
            'word_count', 'sentence_count', 'avg_sentence_length',
            'question_marks', 'exclamation_marks', 'question_ratio', 'exclamation_ratio',
            'positive_words', 'negative_words', 'uncertainty_words', 'tentative_words',
            'first_person_pronouns', 'second_person_pronouns', 'third_person_pronouns'
        ]
        
        # Calculate statistics
        comparison_results = {}
        
        for metric in sentiment_metrics + linguistic_features:
            if metric in df.columns:
                stats = gender_groups[metric].agg(['mean', 'std', 'median', 'count'])
                comparison_results[metric] = stats
        
        # Sentiment category distribution
        sentiment_dist = pd.crosstab(df['gender'], df['sentiment_category'], normalize='index') * 100
        comparison_results['sentiment_distribution'] = sentiment_dist
        
        return comparison_results
    
    def create_visualizations(self, df, comparison_results):
        """Create comprehensive visualizations"""
        plt.style.use('seaborn-v0_8')
        fig = plt.figure(figsize=(20, 24))
        
        # 1. Overall sentiment distribution
        plt.subplot(4, 3, 1)
        sentiment_counts = df['sentiment_category'].value_counts()
        plt.pie(sentiment_counts.values, labels=sentiment_counts.index, autopct='%1.1f%%')
        plt.title('Overall Sentiment Distribution')
        
        # 2. Sentiment by gender
        if 'gender' in df.columns:
            plt.subplot(4, 3, 2)
            gender_sentiment = pd.crosstab(df['gender'], df['sentiment_category'])
            gender_sentiment.plot(kind='bar', ax=plt.gca())
            plt.title('Sentiment Distribution by Gender')
            plt.xticks(rotation=0)
            plt.legend(title='Sentiment')
        
        # 3. VADER compound scores by gender
        if 'gender' in df.columns:
            plt.subplot(4, 3, 3)
            df.boxplot(column='vader_compound', by='gender', ax=plt.gca())
            plt.title('VADER Compound Scores by Gender')
            plt.suptitle('')
        
        # 4. TextBlob polarity by gender
        if 'gender' in df.columns:
            plt.subplot(4, 3, 4)
            df.boxplot(column='textblob_polarity', by='gender', ax=plt.gca())
            plt.title('TextBlob Polarity by Gender')
            plt.suptitle('')
        
        # 5. Word count distribution
        plt.subplot(4, 3, 5)
        if 'gender' in df.columns:
            for gender in df['gender'].unique():
                if pd.notna(gender):
                    subset = df[df['gender'] == gender]['word_count']
                    plt.hist(subset, alpha=0.7, label=gender, bins=20)
            plt.xlabel('Word Count')
            plt.ylabel('Frequency')
            plt.title('Word Count Distribution by Gender')
            plt.legend()
        else:
            plt.hist(df['word_count'], bins=20)
            plt.xlabel('Word Count')
            plt.ylabel('Frequency')
            plt.title('Word Count Distribution')
        
        # 6. Emotion words usage
        if 'gender' in df.columns:
            plt.subplot(4, 3, 6)
            emotion_cols = ['positive_words', 'negative_words', 'uncertainty_words', 'tentative_words']
            gender_emotions = df.groupby('gender')[emotion_cols].mean()
            gender_emotions.plot(kind='bar', ax=plt.gca())
            plt.title('Average Emotion Words Usage by Gender')
            plt.xticks(rotation=0)
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # 7. Pronoun usage
        if 'gender' in df.columns:
            plt.subplot(4, 3, 7)
            pronoun_cols = ['first_person_pronouns', 'second_person_pronouns', 'third_person_pronouns']
            gender_pronouns = df.groupby('gender')[pronoun_cols].mean()
            gender_pronouns.plot(kind='bar', ax=plt.gca())
            plt.title('Average Pronoun Usage by Gender')
            plt.xticks(rotation=0)
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
        
        # 8. Sentence length comparison
        if 'gender' in df.columns:
            plt.subplot(4, 3, 8)
            df.boxplot(column='avg_sentence_length', by='gender', ax=plt.gca())
            plt.title('Average Sentence Length by Gender')
            plt.suptitle('')
        
        # 9. Question and exclamation usage
        if 'gender' in df.columns:
            plt.subplot(4, 3, 9)
            punct_data = df.groupby('gender')[['question_ratio', 'exclamation_ratio']].mean()
            punct_data.plot(kind='bar', ax=plt.gca())
            plt.title('Question and Exclamation Usage by Gender')
            plt.xticks(rotation=0)
            plt.ylabel('Ratio per word')
        
        # 10. Subjectivity by gender
        if 'gender' in df.columns:
            plt.subplot(4, 3, 10)
            df.boxplot(column='textblob_subjectivity', by='gender', ax=plt.gca())
            plt.title('TextBlob Subjectivity by Gender')
            plt.suptitle('')
        
        # 11. Correlation heatmap of sentiment metrics
        plt.subplot(4, 3, 11)
        sentiment_cols = ['textblob_polarity', 'textblob_subjectivity', 'vader_compound', 
                         'vader_positive', 'vader_negative', 'word_count']
        correlation_matrix = df[sentiment_cols].corr()
        sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, ax=plt.gca())
        plt.title('Sentiment Metrics Correlation')
        
        # 12. Sentiment timeline (if timestamp available)
        if 'created_at' in df.columns:
            plt.subplot(4, 3, 12)
            df['created_at'] = pd.to_datetime(df['created_at'])
            daily_sentiment = df.groupby(df['created_at'].dt.date)['vader_compound'].mean()
            daily_sentiment.plot(ax=plt.gca())
            plt.title('Average Daily Sentiment')
            plt.xticks(rotation=45)
        
        plt.tight_layout()
        plt.savefig('sentiment_analysis_comprehensive.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def generate_report(self, df, comparison_results):
        """Generate a comprehensive text report"""
        report = []
        report.append("=" * 80)
        report.append("COMPREHENSIVE SENTIMENT ANALYSIS REPORT")
        report.append("=" * 80)
        
        # Overall statistics
        report.append(f"\nOVERALL STATISTICS:")
        report.append(f"Total messages analyzed: {len(df)}")
        report.append(f"Average VADER compound score: {df['vader_compound'].mean():.3f}")
        report.append(f"Average TextBlob polarity: {df['textblob_polarity'].mean():.3f}")
        report.append(f"Average TextBlob subjectivity: {df['textblob_subjectivity'].mean():.3f}")
        
        # Sentiment distribution
        sentiment_dist = df['sentiment_category'].value_counts()
        report.append(f"\nSENTIMENT DISTRIBUTION:")
        for sentiment, count in sentiment_dist.items():
            percentage = (count / len(df)) * 100
            report.append(f"- {sentiment}: {count} ({percentage:.1f}%)")
        
        # Linguistic features summary
        report.append(f"\nLINGUISTIC FEATURES SUMMARY:")
        report.append(f"Average word count per message: {df['word_count'].mean():.1f}")
        report.append(f"Average sentence length: {df['avg_sentence_length'].mean():.1f}")
        report.append(f"Average questions per message: {df['question_marks'].mean():.2f}")
        report.append(f"Average exclamations per message: {df['exclamation_marks'].mean():.2f}")
        
        # Gender comparison (if available)
        if comparison_results and 'gender' in df.columns:
            report.append(f"\nGENDER-BASED COMPARISON:")
            report.append("-" * 40)
            
            for gender in df['gender'].unique():
                if pd.notna(gender):
                    gender_data = df[df['gender'] == gender]
                    report.append(f"\n{gender.upper()} USERS (n={len(gender_data)}):")
                    report.append(f"- Average VADER compound: {gender_data['vader_compound'].mean():.3f}")
                    report.append(f"- Average TextBlob polarity: {gender_data['textblob_polarity'].mean():.3f}")
                    report.append(f"- Average word count: {gender_data['word_count'].mean():.1f}")
                    report.append(f"- Average sentence length: {gender_data['avg_sentence_length'].mean():.1f}")
                    
                    # Emotion words
                    if 'positive_words' in gender_data.columns:
                        report.append(f"- Positive words per message: {gender_data['positive_words'].mean():.2f}")
                        report.append(f"- Negative words per message: {gender_data['negative_words'].mean():.2f}")
                        report.append(f"- Uncertainty words per message: {gender_data['uncertainty_words'].mean():.2f}")
                        report.append(f"- Tentative words per message: {gender_data['tentative_words'].mean():.2f}")
            
            # Statistical significance testing (basic)
            from scipy import stats
            if len(df['gender'].unique()) == 2:
                genders = df['gender'].unique()
                group1 = df[df['gender'] == genders[0]]['vader_compound']
                group2 = df[df['gender'] == genders[1]]['vader_compound']
                
                if len(group1) > 0 and len(group2) > 0:
                    t_stat, p_value = stats.ttest_ind(group1, group2)
                    report.append(f"\nSTATISTICAL SIGNIFICANCE TEST (VADER Compound):")
                    report.append(f"T-statistic: {t_stat:.3f}")
                    report.append(f"P-value: {p_value:.3f}")
                    if p_value < 0.05:
                        report.append("Result: Statistically significant difference (p < 0.05)")
                    else:
                        report.append("Result: No statistically significant difference (p >= 0.05)")
        
        # Key findings
        report.append(f"\nKEY FINDINGS:")
        report.append("- " + "Most messages have neutral sentiment" if df['sentiment_category'].mode()[0] == 'Neutral' else f"Most messages are {df['sentiment_category'].mode()[0].lower()}")
        
        if df['textblob_subjectivity'].mean() > 0.5:
            report.append("- Messages tend to be more subjective than objective")
        else:
            report.append("- Messages tend to be more objective than subjective")
        
        if 'gender' in df.columns and len(df['gender'].unique()) > 1:
            # Compare average word counts between genders
            gender_word_counts = df.groupby('gender')['word_count'].mean()
            if len(gender_word_counts) == 2:
                genders = list(gender_word_counts.index)
                if gender_word_counts[genders[0]] > gender_word_counts[genders[1]]:
                    report.append(f"- {genders[0]} users write longer messages on average")
                else:
                    report.append(f"- {genders[1]} users write longer messages on average")
        
        return "\n".join(report)
    
    def run_complete_analysis(self, messages_file, participants_file, tasks_file, interactions_file=None):
        """Run the complete sentiment analysis pipeline"""
        print("Loading data...")
        self.load_data(messages_file, participants_file, tasks_file, interactions_file)
        
        print("Analyzing sentiment...")
        sentiment_df = self.analyze_all_messages()
        
        print("Merging with participant data...")
        final_df = self.merge_with_participant_data(sentiment_df)
        
        print("Generating gender comparison...")
        comparison_results = self.generate_gender_comparison(final_df)
        
        print("Creating visualizations...")
        self.create_visualizations(final_df, comparison_results)
        
        print("Generating report...")
        report = self.generate_report(final_df, comparison_results)
        
        # Save results
        final_df.to_csv('sentiment_analysis_results.csv', index=False)
        
        with open('sentiment_analysis_report.txt', 'w', encoding='utf-8') as f:
            f.write(report)
        
        print("Analysis complete! Results saved to:")
        print("- sentiment_analysis_results.csv")
        print("- sentiment_analysis_report.txt")
        print("- sentiment_analysis_comprehensive.png")
        
        return final_df, comparison_results, report

# Usage example:
if __name__ == "__main__":
    # Initialize analyzer
    analyzer = SentimentAnalyzer()
    
    # Run complete analysis
    # Replace with your actual file paths
    results_df, comparison, report = analyzer.run_complete_analysis(
        messages_file='supabase_dump_20250823_040945/message.jsonl',
        participants_file='supabase_dump_20250823_040945/participant.jsonl', 
        tasks_file='supabase_dump_20250823_040945/task.jsonl',
        interactions_file='supabase_dump_20250823_040945/participant_task_interaction.jsonl'
    )
    
    # Print the report
    print("\n" + "="*80)
    print("ANALYSIS REPORT")
    print("="*80)
    print(report)
    
    # Display some key results
    print(f"\nQuick Summary:")
    print(f"- Total messages analyzed: {len(results_df)}")
    if 'gender' in results_df.columns:
        gender_counts = results_df['gender'].value_counts()
        print(f"- Gender distribution: {dict(gender_counts)}")
    
    sentiment_summary = results_df.groupby('sentiment_category').size()
    print(f"- Sentiment breakdown: {dict(sentiment_summary)}")
