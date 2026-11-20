// Rule-based performance coaching advice system
// 32 basketball metrics × 5 score classifications = 160 unique recommendations
// No AI - all advice is predefined based on score thresholds

// Score classification thresholds
export const PERFORMANCE_CLASSIFICATIONS = {
  CRITICAL: { label: 'Critical Focus', color: '#ef4444', range: [0, 3] },      // 0-2.9
  NEEDS_IMPROVEMENT: { label: 'Needs Improvement', color: '#f97316', range: [3, 5] }, // 3-4.9
  DEVELOPING: { label: 'Developing', color: '#eab308', range: [5, 7] },        // 5-6.9
  GOOD: { label: 'Good', color: '#3b82f6', range: [7, 9] },                    // 7-8.9
  EXCELLENT: { label: 'Excellent', color: '#22c55e', range: [9, 10.1] },       // 9-10
};

// Determine classification from score
export function getPerformanceClassification(score) {
  if (score == null) return null;
  const numScore = Number(score);
  
  if (numScore < 3) return 'CRITICAL';
  if (numScore < 5) return 'NEEDS_IMPROVEMENT';
  if (numScore < 7) return 'DEVELOPING';
  if (numScore < 9) return 'GOOD';
  return 'EXCELLENT';
}

// Comprehensive advice library: 32 metrics × 5 classifications
export const BASKETBALL_PERFORMANCE_ADVICE = {
  dribbling_control: {
    CRITICAL: 'Focus on basic ball control and stationary dribbling with both hands. Work on keeping the ball close to your body and maintaining control without looking down.',
    NEEDS_IMPROVEMENT: 'Practise controlled dribbling movements and hand coordination. Develop consistent dribbling in straight lines and circles to build muscle memory and confidence.',
    DEVELOPING: 'Work on maintaining consistent dribbling speed during directional changes. Integrate dribbling drills into game situations with light pressure.',
    GOOD: 'Improve dribbling under defensive pressure and at higher game speeds. Challenge yourself with advanced ball-handling drills and crossover combinations.',
    EXCELLENT: 'Maintain your excellent control consistency. Focus on using dribbling as a strategic tool to create space and execute game plans under pressure.'
  },
  
  crossover_moves: {
    CRITICAL: 'Start with basic crossover fundamentals: plant foot, transfer weight, execute controlled hand switch. Master stationary crossovers before attempting game-speed moves.',
    NEEDS_IMPROVEMENT: 'Practise crossover timing and ball control during hand transfers. Work on low crossovers close to your body to minimize turnovers.',
    DEVELOPING: 'Develop consistency with crossover execution at moderate speeds. Practise chaining multiple crossovers and transitioning into scoring opportunities.',
    GOOD: 'Add game-speed crossovers and improve deceptive footwork. Work on reading defender reactions and executing crossovers in high-pressure situations.',
    EXCELLENT: 'Master advanced crossover variations with acceleration. Use crossovers strategically to create scoring angles and assist opportunities consistently.'
  },
  
  layups_left: {
    CRITICAL: 'Prioritise left-hand finishing fundamentals. Practise correct footwork, approach angles and controlled left-handed layups from various distances.',
    NEEDS_IMPROVEMENT: 'Focus on developing left-hand touch and finishing consistency. Perform repetitive layup drills from different angles to build confidence.',
    DEVELOPING: 'Work on footwork efficiency and soft touch on the rim. Practise layups off the dribble and off catch situations with correct hand usage.',
    GOOD: 'Improve layup finishing under defensive pressure and at game speed. Develop body control and finishing through contact on the left side.',
    EXCELLENT: 'Maintain consistent left-hand finishing across all game situations. Challenge yourself with contested finishes and creative angles.'
  },
  
  layups_right: {
    CRITICAL: 'Master right-hand finishing fundamentals with proper footwork and approach angles. Build confidence through repetitive controlled layup drills.',
    NEEDS_IMPROVEMENT: 'Develop right-hand touch and finishing consistency. Practise layups at game speed from different court positions and angles.',
    DEVELOPING: 'Improve footwork efficiency on the right side. Work on soft touch, proper stepping and transitioning from dribble to finish.',
    GOOD: 'Add game-speed finishing under pressure and in transition. Develop the ability to finish through contact and in off-balance situations.',
    EXCELLENT: 'Maintain elite right-hand finishing consistency. Execute complex finishes in contested situations and incorporate creative finishing techniques.'
  },
  
  blocks: {
    CRITICAL: 'Learn proper shot-blocking stance and positioning. Focus on reading shot release and timing your jump without fouling.',
    NEEDS_IMPROVEMENT: 'Work on shot-blocking timing and positioning. Practise staying vertical and avoiding reaching fouls while defending different shot types.',
    DEVELOPING: 'Improve anticipation and reaction speed for blocks. Develop consistency in timing jumps and reading offensive intentions.',
    GOOD: 'Enhance game-speed shot-blocking instincts. Work on protecting the rim while maintaining defensive responsibilities in zone or man defence.',
    EXCELLENT: 'Maintain elite rim protection while minimizing foul trouble. Use shot-blocking as a psychological edge while supporting overall team defence.'
  },
  
  free_throw_pct: {
    CRITICAL: 'Establish a consistent free-throw routine and form. Focus on mechanics, footwork and follow-through with high-volume repetition.',
    NEEDS_IMPROVEMENT: 'Refine your free-throw mechanics and consistency. Develop a reliable routine and increase shooting volume under pressure conditions.',
    DEVELOPING: 'Improve shooting consistency through targeted drills. Work on mental focus and pressure management during free-throw situations.',
    GOOD: 'Fine-tune shooting form for clutch situations. Develop mental resilience and maintain consistency shooting back-to-back free throws.',
    EXCELLENT: 'Maintain exceptional free-throw shooting. Become a reliable closer in high-pressure moments and provide consistent production from the line.'
  },
  
  defensive_stance: {
    CRITICAL: 'Learn foundational defensive positioning: feet shoulder-width apart, knees bent, active hands. Focus on staying in front of your opponent.',
    NEEDS_IMPROVEMENT: 'Improve stance consistency and balance. Work on maintaining proper alignment and adjusting positioning based on offensive movement.',
    DEVELOPING: 'Refine defensive stance for different situations. Develop quick adjustments for drives, screens and off-ball positioning.',
    GOOD: 'Enhance stance effectiveness in high-intensity situations. Work on anticipation and reactive movement from solid defensive positioning.',
    EXCELLENT: 'Maintain elite defensive stance positioning. Use stance flexibility to defend multiple positions and adjust to offensive setups.'
  },
  
  help_defense: {
    CRITICAL: 'Understand help defence principles: identify threats, rotate properly, recover to your player. Focus on not overhelping and creating openings.',
    NEEDS_IMPROVEMENT: 'Develop help defence timing and positioning. Work on supporting teammates while maintaining awareness of your assignment.',
    DEVELOPING: 'Improve help defence rotations and communication. Learn when to help and when to stay with your player in team defensive schemes.',
    GOOD: 'Enhance help defence instincts at game speed. Work on recovering quickly to shooters and maintaining defensive balance in complex situations.',
    EXCELLENT: 'Execute elite help defence with proper rotations and communication. Anticipate offensive movements and prevent scoring opportunities.'
  },
  
  on_ball_defense: {
    CRITICAL: 'Master on-ball defence fundamentals: stance, positioning, hand placement. Focus on preventing drives and controlling the ball handler.',
    NEEDS_IMPROVEMENT: 'Work on staying in front of your opponent consistently. Develop better footwork and hand placement to contest shots without fouling.',
    DEVELOPING: 'Improve defensive foot speed and positioning. Learn to adjust defensive angles based on ball handler movement and court position.',
    GOOD: 'Enhance on-ball defence at game speed with pressure intensity. Work on physical defence within rules and maintaining positioning against skilled handlers.',
    EXCELLENT: 'Maintain elite on-ball defence consistency. Shut down opponents while avoiding foul trouble and leading team defensive intensity.'
  },
  
  off_ball_movement: {
    CRITICAL: 'Understand off-ball defence positioning and rotations. Focus on staying between your player and the basket while aware of offensive threats.',
    NEEDS_IMPROVEMENT: 'Work on positioning without the ball and react to offensive movement. Develop defensive awareness and anticipation of play development.',
    DEVELOPING: 'Improve defensive spacing and rotation communication. Learn to defend multiple areas while maintaining general assignment responsibility.',
    GOOD: 'Enhance off-ball defence reactivity and decision-making. Work on reading offensive motion and rotating properly in complex schemes.',
    EXCELLENT: 'Execute elite off-ball defence with excellent positioning and awareness. Anticipate plays and move with offensive ball movement.'
  },
  
  passing_accuracy: {
    CRITICAL: 'Focus on basic passing fundamentals: chest passes, bounce passes and accurate target placement. Work on reducing turnovers with simple passes.',
    NEEDS_IMPROVEMENT: 'Improve passing precision and decision-making. Practise different pass types and developing court vision in controlled settings.',
    DEVELOPING: 'Work on passing consistency in game situations. Develop ability to execute different pass types with accuracy from various positions.',
    GOOD: 'Enhance passing timing and court awareness. Work on threading passes through defence and improving assist-to-turnover ratio in high-tempo play.',
    EXCELLENT: 'Maintain elite passing accuracy and creativity. Execute pinpoint passes from all positions and continually improve team ball movement efficiency.'
  },
  
  rebounding: {
    CRITICAL: 'Master rebounding positioning and effort. Focus on box-out fundamentals and aggressive pursuit of missed shots.',
    NEEDS_IMPROVEMENT: 'Work on consistent rebounding effort and positioning. Develop better timing and body positioning to secure more rebounds.',
    DEVELOPING: 'Improve rebounding consistency and aggression. Work on anticipating shot outcomes and positioning advantage against opponents.',
    GOOD: 'Enhance rebounding in high-intensity situations. Develop strong finish over defenders and outlet pass accuracy after rebounds.',
    EXCELLENT: 'Maintain elite rebounding production and positioning. Dominate the boards while maintaining defensive balance and quick outlet passes.'
  },
  
  court_spacing: {
    CRITICAL: 'Understand proper court spacing principles. Focus on maintaining floor balance and staying spread from teammates.',
    NEEDS_IMPROVEMENT: 'Work on spacing consistency during offensive sets. Develop better positioning to create scoring opportunities for self and teammates.',
    DEVELOPING: 'Improve spacing awareness and adjustments. Learn to create proper spacing angles while maintaining floor balance.',
    GOOD: 'Enhance spacing efficiency in high-tempo situations. Work on dynamic spacing adjustments and creating angles for scoring.',
    EXCELLENT: 'Execute elite court spacing consistently. Use positioning to create multiple offensive opportunities and maintain team fluidity.'
  },
  
  screen_setting: {
    CRITICAL: 'Learn proper screen-setting fundamentals: positioning, contact and opening up. Focus on not moving and creating legal screens.',
    NEEDS_IMPROVEMENT: 'Work on screen placement and creating effective picks. Develop better timing and positioning to free up teammates.',
    DEVELOPING: 'Improve screen-setting consistency and variety. Learn to set different types of screens in different offensive situations.',
    GOOD: 'Enhance screen-setting effectiveness in game situations. Work on reading defender reactions and repositioning for scoring opportunities.',
    EXCELLENT: 'Execute elite screen-setting with excellent timing. Use screens strategically and convert pick-and-roll situations into scoring plays.'
  },
  
  pick_and_roll: {
    CRITICAL: 'Master pick-and-roll basics: setting screen, rolling to basket, reading defence. Focus on simple execution without turnovers.',
    NEEDS_IMPROVEMENT: 'Work on pick-and-roll decision-making and timing. Develop better feel for when to roll vs pop in defensive reads.',
    DEVELOPING: 'Improve pick-and-roll execution consistency. Learn to navigate different defensive responses with proper positioning and footwork.',
    GOOD: 'Enhance pick-and-roll effectiveness at game speed. Work on advanced reads, timing and creating scoring opportunities through adjustment.',
    EXCELLENT: 'Execute elite pick-and-roll basketball. Use spacing, timing and reads to consistently create advantages in multiple situations.'
  },
  
  handling_under_pressure: {
    CRITICAL: 'Focus on ball security fundamentals under pressure. Work on staying calm and making simple decisions when defense intensifies.',
    NEEDS_IMPROVEMENT: 'Work on handling consistency when double-teamed or pressured. Develop better escape dribbles and decision-making under pressure.',
    DEVELOPING: 'Improve handling consistency and confidence in pressure situations. Learn to shift pace and direction to escape tight defence.',
    GOOD: 'Enhance advanced ball-handling under game-speed pressure. Work on creating space with ball-handling while maintaining court vision.',
    EXCELLENT: 'Maintain elite handling under maximum defensive pressure. Use advanced techniques to escape traps and create scoring opportunities.'
  },
  
  shot_selection: {
    CRITICAL: 'Learn what constitutes good shot selection: high-percentage area, open looks, game situation. Focus on passing up poor opportunities.',
    NEEDS_IMPROVEMENT: 'Work on improved shot selection and shot-taking discipline. Develop better feel for when to shoot vs pass in game flow.',
    DEVELOPING: 'Improve consistency in shot selection within game situations. Learn position-specific shot values and risk assessment.',
    GOOD: 'Enhance shot-selection awareness under defensive pressure. Work on maintaining efficient shooting while adapting to defensive setups.',
    EXCELLENT: 'Execute elite shot selection consistently. Take high-value shots and improve overall team offensive efficiency through smart decisions.'
  },
  
  transition_offense: {
    CRITICAL: 'Understand transition basketball principles: fast break numbers, spacing and finishing. Focus on executing simple plays efficiently.',
    NEEDS_IMPROVEMENT: 'Work on transition finishing and decision-making. Develop better timing and spacing in 3-on-2 and 2-on-1 situations.',
    DEVELOPING: 'Improve transition consistency and ball movement. Learn to read defensive positioning and make proper outlet passes.',
    GOOD: 'Enhance transition effectiveness at game speed. Work on attacking with purpose and making timely decisions in high-tempo situations.',
    EXCELLENT: 'Execute elite transition basketball. Push pace effectively, make smart decisions and finish consistently in open-court situations.'
  },
  
  transition_defense: {
    CRITICAL: 'Learn transition defence basics: sprint back, identify threats, defend numbers disadvantages. Focus on preventing easy baskets.',
    NEEDS_IMPROVEMENT: 'Work on transition defence consistency and positioning. Develop better communication and defensive intensity in open court.',
    DEVELOPING: 'Improve transition defence communication and rotations. Learn to defend effectively in outnumbered situations.',
    GOOD: 'Enhance transition defence at game speed. Work on anticipating pass lanes and preventing scoring opportunities.',
    EXCELLENT: 'Execute elite transition defence. Consistently prevent easy baskets and convert defensive stops into offensive opportunities.'
  },
  
  three_point_accuracy: {
    CRITICAL: 'Master three-point shooting mechanics: footwork, form, follow-through. Focus on shooting consistency from corner and wing positions.',
    NEEDS_IMPROVEMENT: 'Work on three-point consistency and shot-taking volume. Develop better form under game conditions with higher shooting volume.',
    DEVELOPING: 'Improve three-point accuracy from all spots. Work on catch-and-shoot consistency and off-the-dribble three-point shooting.',
    GOOD: 'Enhance three-point shooting in high-intensity situations. Work on contested threes and shooting under defensive pressure.',
    EXCELLENT: 'Maintain elite three-point shooting production. Consistently make difficult three-pointers and provide spacing floor shooting.'
  },
  
  mid_range_accuracy: {
    CRITICAL: 'Build mid-range shooting fundamentals and consistency. Focus on improving form and shot selection within 15 feet of the basket.',
    NEEDS_IMPROVEMENT: 'Work on mid-range shooting consistency and form refinement. Develop better footwork and release mechanics.',
    DEVELOPING: 'Improve mid-range accuracy from different spots and angles. Work on creating separation for mid-range shots.',
    GOOD: 'Enhance mid-range shooting under defensive pressure. Work on difficult mid-range finishing and consistency in contested situations.',
    EXCELLENT: 'Maintain elite mid-range shooting production. Use mid-range shooting to create scoring versatility and offensive unpredictability.'
  },
  
  shot_release_speed: {
    CRITICAL: 'Work on speeding up shot release mechanics. Focus on quick catch-and-shoot mechanics and reducing shooting motion complexity.',
    NEEDS_IMPROVEMENT: 'Improve release speed through mechanical refinement. Work on quicker release without sacrificing accuracy.',
    DEVELOPING: 'Work on faster release in game situations. Develop quicker catch-and-shoot mechanics and off-the-dribble release.',
    GOOD: 'Enhance release speed at game tempo. Work on quick-release threes and faster finishing on catch-and-shoot opportunities.',
    EXCELLENT: 'Maintain elite quick-release shooting. Execute instant-release shots in high-pressure situations while maintaining accuracy.'
  },
  
  catch_and_shoot_footwork: {
    CRITICAL: 'Master catch-and-shoot footwork basics: receiving pass, setting feet, shooting. Focus on balance and consistency.',
    NEEDS_IMPROVEMENT: 'Work on catch-and-shoot footwork consistency. Improve footwork efficiency from different catch positions.',
    DEVELOPING: 'Improve catch-and-shoot footwork variety and consistency. Work on shooting off movement and off-balance positioning.',
    GOOD: 'Enhance catch-and-shoot footwork at game speed. Work on quick feet and shooting on movement consistently.',
    EXCELLENT: 'Execute elite catch-and-shoot footwork. Shoot effectively off any pass and maintain balance in all catch-and-shoot situations.'
  },
  
  weak_hand_dribbling: {
    CRITICAL: 'Build weak-hand dribbling fundamentals. Focus on stationary dribbling with your non-dominant hand in controlled settings.',
    NEEDS_IMPROVEMENT: 'Work on weak-hand dribbling consistency and control. Develop more confidence using your non-dominant hand in practice.',
    DEVELOPING: 'Improve weak-hand dribbling speed and control. Work on mixing weak-hand dribbling into game situations.',
    GOOD: 'Enhance weak-hand dribbling effectiveness at game speed. Work on escaping pressure and executing plays with weak-hand control.',
    EXCELLENT: 'Maintain excellent weak-hand dribbling. Execute complex plays with non-dominant hand and create advantages through ambidextrous ball-handling.'
  },
  
  passing_under_pressure: {
    CRITICAL: 'Learn decision-making fundamentals when pressured. Focus on simple passes and reducing turnovers in high-pressure situations.',
    NEEDS_IMPROVEMENT: 'Work on staying calm under pressure and making smart passes. Develop better decision-making when defence intensifies.',
    DEVELOPING: 'Improve passing timing and accuracy under pressure. Learn to thread passes through tighter defensive windows.',
    GOOD: 'Enhance passing execution under game-speed pressure. Work on difficult passes in high-intensity situations.',
    EXCELLENT: 'Execute elite passing under maximum pressure. Make pinpoint passes through tight defence and maintain offensive flow.'
  },
  
  post_up_moves: {
    CRITICAL: 'Master post-up fundamentals: positioning, footwork, finishing. Focus on basic back-down moves and close-range finishing.',
    NEEDS_IMPROVEMENT: 'Work on post-up footwork consistency and decision-making. Develop better balance and footwork variations.',
    DEVELOPING: 'Improve post-up execution with multiple moves and counters. Learn when to use different post moves in game situations.',
    GOOD: 'Enhance post-up effectiveness at game speed. Work on reading defence and executing advanced post moves with defenders present.',
    EXCELLENT: 'Execute elite post-up basketball. Use footwork, strength and reads to finish consistently against defensive pressure.'
  },
  
  rebound_positioning: {
    CRITICAL: 'Learn box-out fundamentals and positioning basics. Focus on using body to establish rebounding position.',
    NEEDS_IMPROVEMENT: 'Work on consistent box-out effort and positioning. Develop better timing and body placement against opponents.',
    DEVELOPING: 'Improve rebounding positioning and anticipation. Learn to predict shot outcomes and position for advantage.',
    GOOD: 'Enhance rebounding positioning in high-intensity situations. Work on maintaining position against physical opposition.',
    EXCELLENT: 'Maintain elite rebounding positioning and box-out technique. Dominate positioning battles consistently throughout games.'
  },
  
  fast_break_decision: {
    CRITICAL: 'Understand fast-break decision-making: when to push vs slow down, passing vs shooting. Focus on simple decisions.',
    NEEDS_IMPROVEMENT: 'Work on fast-break decision-making consistency. Develop better feel for when to finish vs kick-out.',
    DEVELOPING: 'Improve fast-break decision timing and accuracy. Learn to read defensive positioning and make split-second decisions.',
    GOOD: 'Enhance fast-break decision-making at full speed. Work on advanced reads and converting numbers advantages.',
    EXCELLENT: 'Execute elite fast-break decisions. Consistently make winning plays in transition and maximize open-court opportunities.'
  },
  
  court_vision: {
    CRITICAL: 'Learn basic court vision: awareness of floor, simple passes to open teammates. Focus on accurate passes in set offence.',
    NEEDS_IMPROVEMENT: 'Work on court vision consistency and awareness. Develop better spacing recognition and pass selection.',
    DEVELOPING: 'Improve court vision consistency in game flow. Learn to find open teammates and create scoring opportunities.',
    GOOD: 'Enhance court vision in high-tempo situations. Work on difficult passes and maintaining floor vision under pressure.',
    EXCELLENT: 'Execute elite court vision. See the floor exceptionally well and create consistent scoring opportunities through passing.'
  },
  
  leadership: {
    CRITICAL: 'Develop basic communication and leadership skills: calling plays, encouraging teammates. Focus on positive impact on team culture.',
    NEEDS_IMPROVEMENT: 'Work on leadership consistency and communication on court. Develop vocal leadership and positive energy.',
    DEVELOPING: 'Improve leadership impact and team communication. Learn to lead by example and elevate teammates performance.',
    GOOD: 'Enhance leadership in high-pressure situations. Work on decision-making and maintaining team focus during challenging moments.',
    EXCELLENT: 'Demonstrate elite leadership and court presence. Lead team effectively through communication, actions and consistent play.'
  },
  
  strategy: {
    CRITICAL: 'Understand basic game strategy and positioning. Focus on understanding your role in team offensive/defensive systems.',
    NEEDS_IMPROVEMENT: 'Work on strategy understanding and execution consistency. Develop better feel for team positioning and assignments.',
    DEVELOPING: 'Improve strategic awareness and decision-making. Learn multiple roles and strategic approaches in different game situations.',
    GOOD: 'Enhance strategic execution at game speed. Work on reading defence and adjusting strategy based on opponent adjustments.',
    EXCELLENT: 'Execute elite basketball strategy. Understand complex systems and make winning strategic decisions consistently.'
  },
  
  mindset: {
    CRITICAL: 'Develop mental toughness fundamentals: focus, resilience, accountability. Focus on staying positive and engaged.',
    NEEDS_IMPROVEMENT: 'Work on mental consistency and handling adversity. Develop better focus under pressure and in challenging situations.',
    DEVELOPING: 'Improve mental toughness in competitive situations. Learn to bounce back from mistakes and maintain confidence.',
    GOOD: 'Enhance mindset in high-pressure moments. Work on championship mindset and performing under maximum stress.',
    EXCELLENT: 'Maintain elite mental approach. Demonstrate exceptional resilience, focus and competitive drive in all situations.'
  },
};

// Get advice for a specific metric and score
export function getPerformanceAdvice(metricKey, score) {
  if (score == null) return null;
  
  const classification = getPerformanceClassification(score);
  if (!classification) return null;
  
  const metricAdvice = BASKETBALL_PERFORMANCE_ADVICE[metricKey];
  if (!metricAdvice) return null;
  
  return metricAdvice[classification] || null;
}

// Get all recommendations for a metric
export function getAllRecommendations(metricKey) {
  return BASKETBALL_PERFORMANCE_ADVICE[metricKey] || null;
}
