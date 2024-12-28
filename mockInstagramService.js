// src/services/mockInstagramService.js

class MockInstagramService {
    constructor() {
      this.hashtagDatabase = new Map([
        ['explorar', { 
          posts: 45000000, 
          avgLikes: 2500, 
          avgComments: 120, 
          growth: 'high',
          peakHours: [9, 13, 17, 21],
          viralProbability: 0.4,
          velocityMultiplier: 1.5,
          regionBonus: 1.2
        }],
        ['explorepage', { 
          posts: 38000000, 
          avgLikes: 2300, 
          avgComments: 110, 
          growth: 'high',
          peakHours: [10, 14, 18, 22],
          viralProbability: 0.45,
          velocityMultiplier: 1.6,
          regionBonus: 1.3
        }],
        ['explore', { 
          posts: 52000000, 
          avgLikes: 2800, 
          avgComments: 130, 
          growth: 'high',
          peakHours: [11, 15, 19, 23],
          viralProbability: 0.5,
          velocityMultiplier: 1.7,
          regionBonus: 1.4
        }],
        ['exploremore', { 
          posts: 28000000, 
          avgLikes: 2000, 
          avgComments: 95, 
          growth: 'medium',
          peakHours: [8, 12, 16, 20],
          viralProbability: 0.35,
          velocityMultiplier: 1.4,
          regionBonus: 1.1
        }],
        ['foryou', { 
          posts: 65000000, 
          avgLikes: 3200, 
          avgComments: 150, 
          growth: 'high',
          peakHours: [10, 14, 18, 22],
          viralProbability: 0.55,
          velocityMultiplier: 1.8,
          regionBonus: 1.5
        }],
        ['foryoupage', { 
          posts: 58000000, 
          avgLikes: 3000, 
          avgComments: 140, 
          growth: 'high',
          peakHours: [9, 13, 17, 21],
          viralProbability: 0.5,
          velocityMultiplier: 1.7,
          regionBonus: 1.4
        }],
        ['foryourpage', { 
          posts: 48000000, 
          avgLikes: 2700, 
          avgComments: 125, 
          growth: 'high',
          peakHours: [11, 15, 19, 23],
          viralProbability: 0.48,
          velocityMultiplier: 1.6,
          regionBonus: 1.3
        }],
        ['fyp', { 
          posts: 75000000, 
          avgLikes: 3500, 
          avgComments: 160, 
          growth: 'viral',
          peakHours: [10, 14, 18, 22],
          viralProbability: 0.6,
          velocityMultiplier: 2.0,
          regionBonus: 1.6
        }],
        ['fypシ', { 
          posts: 42000000, 
          avgLikes: 2600, 
          avgComments: 120, 
          growth: 'high',
          peakHours: [9, 13, 17, 21],
          viralProbability: 0.5,
          velocityMultiplier: 1.7,
          regionBonus: 1.4
        }],
        ['trending', { 
          posts: 55000000, 
          avgLikes: 3000, 
          avgComments: 135, 
          growth: 'viral',
          peakHours: [11, 15, 19, 23],
          viralProbability: 0.55,
          velocityMultiplier: 1.8,
          regionBonus: 1.5
        }]
      ]);
  
      this.growthFactors = {
        'low': 1,
        'medium': 1.2,
        'high': 1.5,
        'viral': 2
      };
  
      this.timeZoneOffset = new Date().getTimezoneOffset() / 60;
    }
  
    calculateViralGrowth(baseEngagement, hashtagData, timestamp) {
      const hour = new Date(timestamp).getHours();
      const isPeakHour = hashtagData.peakHours.includes(hour);
      const isViral = Math.random() < hashtagData.viralProbability;
      
      let multiplier = 1;
      
      // Base growth factor
      multiplier *= this.growthFactors[hashtagData.growth];
      
      // Peak hour bonus
      if (isPeakHour) multiplier *= 1.5;
      
      // Regional bonus (time zone based)
      const localHour = (hour + this.timeZoneOffset) % 24;
      if (localHour >= 8 && localHour <= 23) {
        multiplier *= hashtagData.regionBonus;
      }
      
      // Viral boost
      if (isViral) {
        multiplier *= hashtagData.velocityMultiplier;
        // Add exponential growth for viral content
        multiplier *= (1 + Math.random() * 0.5);
      }
      
      return Math.round(baseEngagement * multiplier);
    }
  
    calculateVelocityMetrics(recentPosts, hashtagData) {
      const timeWindows = [1, 3, 6, 12, 24]; // hours
      const metrics = {};
      
      timeWindows.forEach(hours => {
        const windowStart = new Date(Date.now() - hours * 60 * 60 * 1000);
        const postsInWindow = recentPosts.filter(post => 
          new Date(post.timestamp) > windowStart
        );
        
        const totalEngagement = postsInWindow.reduce((sum, post) => 
          sum + post.like_count + post.comments_count, 0
        );
        
        const averageEngagement = totalEngagement / (postsInWindow.length || 1);
        const engagementVelocity = totalEngagement / (hours || 1);
        
        metrics[`${hours}h_velocity`] = {
          posts: postsInWindow.length,
          total_engagement: totalEngagement,
          avg_engagement: averageEngagement,
          velocity: engagementVelocity,
          viral_coefficient: engagementVelocity / (hashtagData.avgLikes + hashtagData.avgComments)
        };
      });
      
      return metrics;
    }
  
    generateTimeBasedEngagement(avgEngagement, hashtagData) {
      const now = new Date();
      return Array.from({ length: 24 }, (_, hour) => {
        const isPeakHour = hashtagData.peakHours.includes(hour);
        const timeBasedMultiplier = isPeakHour ? 1.5 : 1;
        const timestamp = new Date(now.setHours(hour)).toISOString();
        
        return {
          hour: `${hour}:00`,
          engagement: this.calculateViralGrowth(
            avgEngagement * timeBasedMultiplier,
            hashtagData,
            timestamp
          )
        };
      });
    }
  
    async searchHashtag(term) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
  
      const results = Array.from(this.hashtagDatabase.entries())
        .filter(([tag]) => tag.toLowerCase().includes(term.toLowerCase()))
        .map(([tag, data]) => ({
          tag,
          posts: data.posts,
          engagement_rate: ((data.avgLikes + data.avgComments) / data.posts * 100).toFixed(2),
          viral_probability: (data.viralProbability * 100).toFixed(1),
          growth_type: data.growth
        }));
  
      return results;
    }
  
    async getHashtagMetrics(tag) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const hashtagData = this.hashtagDatabase.get(tag.toLowerCase());
      if (!hashtagData) throw new Error('Hashtag not found');
  
      // Generate recent posts with viral growth patterns
      const recentPosts = Array.from({ length: 30 }, (_, i) => {
        const timestamp = new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString();
        const engagement = this.calculateViralGrowth(
          hashtagData.avgLikes + hashtagData.avgComments,
          hashtagData,
          timestamp
        );
        
        return {
          id: `post_${i}`,
          timestamp,
          like_count: Math.round(engagement * 0.8), // 80% likes, 20% comments
          comments_count: Math.round(engagement * 0.2),
          velocity_score: engagement / (hashtagData.avgLikes + hashtagData.avgComments)
        };
      });
  
      const velocityMetrics = this.calculateVelocityMetrics(recentPosts, hashtagData);
      const timeEngagement = this.generateTimeBasedEngagement(
        hashtagData.avgLikes + hashtagData.avgComments,
        hashtagData
      );
  
      return {
        tag,
        metrics: {
          total_posts: hashtagData.posts,
          engagement_rate: ((hashtagData.avgLikes + hashtagData.avgComments) / hashtagData.posts * 100).toFixed(2),
          peak_hours: hashtagData.peakHours,
          recent_posts: recentPosts,
          time_engagement: timeEngagement,
          velocity_metrics: velocityMetrics,
          viral_potential: hashtagData.viralProbability * 100,
          growth_multiplier: hashtagData.velocityMultiplier,
          region_bonus: hashtagData.regionBonus
        }
      };
    }
  
    async subscribeToUpdates(tag, callback) {
      const hashtagData = this.hashtagDatabase.get(tag.toLowerCase());
      if (!hashtagData) throw new Error('Hashtag not found');
  
      const updateInterval = setInterval(async () => {
        const timestamp = new Date().toISOString();
        const newEngagement = this.calculateViralGrowth(
          hashtagData.avgLikes + hashtagData.avgComments,
          hashtagData,
          timestamp
        );
  
        callback({
          timestamp,
          engagement: newEngagement,
          is_viral: Math.random() < hashtagData.viralProbability
        });
      }, 5000); // Update every 5 seconds
  
      // Return cleanup function
      return () => clearInterval(updateInterval);
    }
  }
  
  export default new MockInstagramService();