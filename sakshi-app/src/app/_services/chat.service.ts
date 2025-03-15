import { Injectable } from '@angular/core';
import type { Chat, ChatResponse } from '../_models/Chat';
import { BehaviorSubject } from 'rxjs';

const responses: ChatResponse[] = [
  {
    timestamp: '2025-03-15T08:00:32.827782',
    critic_prompt:
      "I'm doing okay, thanks for asking. To be honest, I've been feeling a bit overwhelmed lately. It feels like I'm juggling a lot of different things, both at work and at home, and I'm not really succeeding at any of them as much as I'd like. I am generally a very optimistic person though, and I really want to get back to feeling more in control and more\u2026 effective. That's why I'm here, really. I am hoping to figure out how to manage things better.",
    app_response:
      "It sounds like you're carrying a lot right now, and while you describe yourself as generally optimistic, the feeling of being overwhelmed seems quite present. Could you tell me a bit more about what it's like to juggle those different work and home responsibilities, and what specifically makes you feel like you're not succeeding as much as you'd like?",
  },
  {
    timestamp: '2025-03-15T08:00:51.473498',
    critic_prompt:
      "Okay, well at work, I'm a project manager, and we've got three major projects running concurrently right now. Each one has its own unique challenges and deadlines, and I'm finding it hard to keep all the balls in the air, so to speak. I'm constantly putting out fires. I feel like I'm reacting instead of proactively managing. At home, my aging mother has needed more help lately, and my kids are at that age where they need you, but also\u2026 don't! (chuckles) So, I'm pulled in a lot of different directions. What makes me feel like I'm not succeeding? Well, for example, at work, a critical deliverable was almost late last week because I didn't catch a potential issue early enough. Luckily, we scrambled and got it done, but it was stressful. And at home, I feel guilty that I'm not giving my kids the attention they deserve or helping my mom as much as I should. But hey, I know I can work on this with the right direction.",
    app_response:
      "It sounds like you're balancing a lot of pressure from work and family, and you mentioned feeling guilty about not giving your kids and mother the attention they deserve. Could you tell me more about what those feelings of guilt feel like specifically, and what thoughts or images come to mind when you experience them?",
  },
  {
    timestamp: '2025-03-15T08:01:10.176343',
    critic_prompt:
      "Those feelings of guilt are like a heavy weight on my chest, you know? It's a constant worry that I'm letting people down. When it comes to my kids, I see their faces \u2013 happy when I'm present, but sometimes a little\u2026 distant, like they're used to me not being fully there. I imagine them thinking I'm too busy. With my mom, it's similar. I picture her struggling with something, and I'm not there to help. I know logically I can't be everywhere at once, but the feeling persists. I know these feeling aren't permanent and with some guidance, I am confident that I can get over these.",
    app_response:
      "It sounds like those images of your kids and mother are particularly impactful when you experience the guilt. You also mentioned you're confident that with guidance you will overcome these feelings. I wonder, what makes you so confident in your ability to manage these challenging emotions, and what kind of guidance do you envision being most helpful?",
  },
  {
    timestamp: '2025-03-15T08:01:28.058230',
    critic_prompt:
      "Well, I'm generally a solutions-oriented person. I believe that with the right tools and strategies, most challenges can be overcome. Plus, I've successfully navigated tough situations in the past, so I know I have the capacity to handle this too. As for guidance, I'm hoping for some practical techniques for time management and prioritization, maybe some communication strategies to help me better connect with my kids and communicate my limitations to my mom, and perhaps some ways to manage the stress and guilt I'm feeling. I think having concrete action steps will be really empowering.",
    app_response:
      "That's great you feel confident in your ability to overcome these challenges with the right strategies. You mentioned you've successfully navigated tough situations before. Can you share an example of a particularly challenging situation you overcame, and what specific tools or strategies were most helpful in that instance? I'm curious how you feel that situation might relate to what you're experiencing now.",
  },
  {
    timestamp: '2025-03-15T08:01:47.648442',
    critic_prompt:
      "Sure. A few years ago, my team was facing a major project setback. We were significantly behind schedule, morale was low, and there was a lot of finger-pointing. I stepped in and facilitated a series of meetings to identify the root causes of the delays, improve communication, and re-establish clear roles and responsibilities. I also implemented a project management system that helped us track progress and identify potential roadblocks early on. The key was really open communication and a focus on collaborative problem-solving. We ended up delivering the project successfully, albeit late, but we learned a lot as a team. \n\nI think that experience relates to what I'm going through now because it highlights the importance of proactive communication, clear prioritization, and effective time management. I was able to successfully navigate that situation by breaking it down into manageable parts, communicating openly, and focusing on solutions. I know I can apply similar principles to my current challenges, but I need some help tailoring those strategies to fit my specific circumstances and learning some new techniques for time management and emotional regulation.",
    app_response:
      "That's a great example of how you successfully navigated a challenging situation at work. Thinking about the differences between that project and your current situation at work and home, what feels most different or more challenging this time around, and how do those differences impact your ability to apply those same strategies?",
  },
  {
    timestamp: '2025-03-15T08:02:07.018821',
    critic_prompt:
      "Well, I think the biggest difference is the emotional element. Back then, it was primarily a work problem, and I could approach it logically and systematically. Now, the lines between work and home are blurred, and there's a significant emotional toll. It's not just about managing tasks; it's about managing guilt, stress, and the feeling that I'm letting people down. \n\nAlso, at work, I had a defined team and clear authority. At home, the dynamics are different. I can't 'manage' my family in the same way I manage a project. My mom and kids have their own needs and feelings, and I need to be more sensitive and responsive to those. Plus, the sheer volume of demands feels overwhelming. It's harder to prioritize when everything feels equally important and urgent. I'm stretched thin, and that makes it difficult to apply those same strategies with the same effectiveness.",
    app_response:
      "You mentioned the emotional element being a significant difference this time around, and the guilt, stress, and feeling of letting people down. Considering the ways you successfully managed your team during the project setback, what aspects of those experiences feel most difficult to translate into strategies for managing these intense emotions you're currently experiencing at home?",
  },
  {
    timestamp: '2025-03-15T08:02:26.577281',
    critic_prompt:
      "It's difficult because, in the work scenario, I could separate myself from the emotional fallout. I could see the problem objectively and focus on solutions without getting bogged down in personal feelings. However, at home, these emotions are directly tied to my loved ones, making it harder to detach and think clearly. \n\nFor example, during the project, if someone was upset, I could address their concerns professionally and move forward. At home, if my child is upset because I missed their soccer game, it triggers a wave of guilt and self-doubt that makes it hard to be present and supportive. I find myself dwelling on my shortcomings instead of focusing on finding a way to make it up to them or prevent it from happening again. It clouds my judgment, and I can't seem to shake these feelings off that easily as I did at work. I understand I need a different set of skills to manage my emotions and approach the situation differently. It is important to acknowledge the difference between the two scenarios and find an effective solution to manage those two very different situations.",
    app_response:
      'It sounds like the guilt and self-doubt you experience at home are particularly powerful and difficult to manage. Can you recall a specific instance where those feelings were especially strong, and if so, what was happening in that moment that made it so challenging to detach or think clearly?',
  },
  {
    timestamp: '2025-03-15T08:02:45.529240',
    critic_prompt:
      "Well, last week was particularly tough. I had promised my daughter I'd help her with her science project, and I was genuinely looking forward to it. But then, a crisis erupted at work, demanding my immediate attention. I ended up working late into the night, completely missing the opportunity to help her. The next morning, she didn't say anything, but I could see the disappointment in her eyes. That really stung. I felt like I had failed her, and the guilt just washed over me. It was hard to concentrate at work the next day because I kept replaying the scenario in my head. I wanted to make it up to her, but I was also afraid of disappointing her again if another work emergency came up. It was a difficult situation, and I felt helpless and overwhelmed. I know I have the skills and tools to address this situation, but I need help figuring out what to do or how to do it.",
    app_response:
      'It sounds like that was a really painful experience with your daughter. You mentioned feeling helpless and overwhelmed. Could you describe what that feeling of helplessness felt like in your body at that moment, and what thoughts were going through your mind aside from replaying the scenario?',
  },
  {
    timestamp: '2025-03-15T08:03:04.174654',
    critic_prompt:
      "Okay, well, the helplessness felt like a knot in my stomach, a really tight feeling. My shoulders were tense, and I felt this urge to just\u2026 withdraw. It was like my body was physically reacting to the guilt. And my thoughts? Aside from replaying the scenario, I was also thinking about all the other times I had missed important moments, and I started to question whether I was prioritizing things right. I worried that my work was taking over my life and that I was sacrificing my family's happiness for my career. I questioned if I am doing enough to separate my work and personal life. It was a downward spiral of negative thoughts, but I also know that I can break free from this cycle with the right help and a little bit of\u2026 perspective. I believe I can do this and will figure out how to do this.",
    app_response:
      "It sounds like that moment with your daughter was incredibly impactful, and you're recognizing a pattern of missed moments leading to these difficult feelings. You also mentioned believing you can break free from this cycle with the right help and perspective. What do you imagine that 'right help' looking like in terms of how it might specifically address those recurring feelings of guilt and the worry that you're sacrificing your family's happiness?",
  },
  {
    timestamp: '2025-03-15T08:03:22.343477',
    critic_prompt:
      "Well, I think the 'right help' would involve a few key things. First, I need some practical strategies for managing my time and setting boundaries between work and home. For example, techniques for prioritizing tasks, delegating responsibilities, and saying 'no' to things that aren't essential. Second, I'd really value guidance on how to reframe my thinking about work-life balance. I need to find a way to feel less guilty about not being able to do everything and to focus on the quality of the time I do spend with my family, rather than the quantity. Perhaps some mindfulness exercises or cognitive techniques to challenge those negative thought patterns? Finally, some support in developing better communication skills to express my needs and limitations to both my work and family. I think if I had those tools, I'd feel much more in control and less overwhelmed, and I could start to break free from this cycle of guilt and worry. I'm confident that with the right approach, I can achieve a healthier balance and create more positive experiences for myself and my family.",
    app_response:
      "You've identified some really helpful strategies for managing your time, reframing your thinking, and communicating your needs. Thinking about applying these strategies in practice, which one feels like the most significant hurdle for you right now, and what specific obstacles do you anticipate encountering when you try to implement it?",
  },
  {
    timestamp: '2025-03-15T08:03:41.706549',
    critic_prompt:
      "Well, honestly, setting boundaries between work and home feels like the most significant hurdle right now. I anticipate a few obstacles. First, there's the expectation at work to be available at all times. It's subtle, but it's there. Saying 'no' to a request after hours feels like I'm letting the team down. Second, there's my own internal drive to be productive and helpful. I sometimes feel guilty if I'm not working, even when I should be relaxing or spending time with my family. And third, there's the practical challenge of actually creating physical and mental separation between work and home when my office is in my house. It's hard to 'turn off' when the reminders of work are always present. I think if I can conquer that first, I can start figuring out the other things.",
    app_response:
      "It sounds like those subtle expectations at work and your own internal drive create a powerful pull to be constantly available. Could you describe a recent specific instance where you felt that pressure to be available after hours, and what the immediate consequences were for you, both at work and at home, when you either did or didn't meet that expectation?",
  },
  {
    timestamp: '2025-03-15T08:04:00.957908',
    critic_prompt:
      "Well, just last week, I was about to sit down for dinner with my family when I received an urgent email from my boss about a critical project deliverable that was facing a last-minute issue. I knew that addressing it would likely take a few hours, but I also felt this immense pressure to respond immediately and fix it. \n\nI ended up excusing myself from dinner, going back to my home office, and working on the issue until late into the night. As a consequence, I missed out on quality time with my family. My kids were disappointed, and my wife was frustrated that I couldn't disconnect from work, but on the other hand, I resolved the issue and ensured that the project stayed on track. The immediate consequence at work was that the problem was solved, and my boss was pleased. However, the long-term consequence at home was that it reinforced this expectation that I'm always available, and it created more distance between me and my family. Honestly, I think that pressure of expectation is there, and with the right help, I know I can work through this. I just don't know what the steps are for me to take.",
    app_response:
      "It sounds like that instance really highlights the difficult choice you face between work and family. You mentioned that the work consequence was a pleased boss, but the family consequence was increased distance. I'm curious, as you reflect on that situation, what specific thoughts or feelings arise when you consider that those two consequences seem to be in direct conflict with each other?",
  },
  {
    timestamp: '2025-03-15T08:04:20.218698',
    critic_prompt:
      "Well, honestly, it makes me feel torn. On one hand, I'm proud of my work ethic and my ability to solve problems and deliver results. There's a sense of satisfaction in knowing that I'm good at my job and that my boss appreciates my efforts. But on the other hand, the guilt and disappointment I feel when I prioritize work over my family is overwhelming. It makes me question my values and whether I'm living my life in alignment with what's truly important to me. I start to wonder if I'm sacrificing my family's well-being for the sake of my career. I would also start thinking that the career I am working so hard in, is it going to be with the same company in the long run or am I just delaying the inevitable of finding myself without a job and without having spent time with my family? Those two consequences highlight the deep conflict within me, and it makes me realize that I need to find a way to reconcile these competing priorities before they take an even greater toll on my well-being and my relationships.",
    app_response:
      "You've painted a vivid picture of feeling torn between your dedication to work and the importance of your family. As you envision potentially finding yourself without a job and without having spent that crucial time with your loved ones, what specific fears or worries surface for you about that possible future, and how do you see those fears influencing the choices you're making right now?",
  },
  {
    timestamp: '2025-03-15T08:04:39.348195',
    critic_prompt:
      "Well, the biggest fear is regret. The thought of looking back years from now and realizing I missed out on my kids' childhoods or that I wasn't there for my mom when she needed me\u2026 that's terrifying. I worry that I'll have sacrificed those precious moments for a career that ultimately didn't fulfill me or that didn't even last. This fear definitely influences my choices right now because it makes me hesitant to fully commit to setting boundaries. There's a part of me that thinks, 'If I just work a little harder, put in a few more hours, I can secure my job and avoid that future.' But I know that's not a sustainable solution. That's why I'm seeking help. I need a more effective way to manage my time and energy, so I can alleviate that fear and create a more balanced and fulfilling life.",
    app_response:
      "That fear of regret sounds incredibly powerful. Considering that this fear makes you hesitant to set boundaries, what would it look like, in practical terms, to start setting boundaries in a way that feels manageable and less threatening to your sense of job security, even if it's just a small step?",
  },
  {
    timestamp: '2025-03-15T08:04:58.265761',
    critic_prompt:
      "Okay, well, maybe a manageable first step would be to block out a specific hour each evening \u2013 say, from 6:00 PM to 7:00 PM \u2013 and declare it 'family time,' no exceptions. During that hour, I would put my phone on silent, turn off my computer, and fully engage with my family, whether it's playing a game, reading a book, or just talking. It's just one hour, but it would be a dedicated time where I'm not available for work. The biggest challenge will be sticking to it if something 'urgent' comes up, but I can try to remind myself that that hour is sacred and that my family deserves my undivided attention. I am confident that I can achieve that first step if I put my mind into it. I will then think of ways to expand it to other days or hours.",
    app_response:
      'That sounds like a great first step. Given your past experiences with work emergencies intruding on personal time, what specific strategies or backup plans can you put in place to help you maintain that sacred hour of family time, even when unexpected work demands arise?',
  },
  {
    timestamp: '2025-03-15T08:05:16.883651',
    critic_prompt:
      "Okay, a couple of things come to mind. First, I could proactively communicate to my team and boss that I'll be unavailable between 6:00 and 7:00 PM each evening, unless it's a true emergency. Setting that expectation upfront might help reduce the number of non-urgent requests during that time. I know that's a challenge but I think it could be a good starting point. Second, I could designate a colleague as a backup person to handle urgent issues during that hour. That way, I know things are still being taken care of, even when I'm not directly involved. Of course, this would require some coordination and trust, but it could provide some peace of mind. I also think I can write down a plan and a possible scenario and how to address it in case those come about.",
    app_response:
      "That's a really proactive approach to protecting your family time. I'm curious, what potential challenges do you foresee in coordinating with a colleague to act as a backup, and how might you address those to ensure you feel comfortable and confident in relying on them during that dedicated hour?",
  },
  {
    timestamp: '2025-03-15T08:05:35.974001',
    critic_prompt:
      "Well, the biggest one is competence and preparedness. I'd need to ensure they're fully capable of handling whatever might arise. I could document very clearly the protocols and procedures for the most likely scenarios, so they have a reference guide. A daily check-in, maybe 15 minutes before I leave, to flag potential issues could help. Shadowing each other could help them understand the problem better and increase their confidence. But at the end of the day, it will rely on trust that I can rely on them to handle those problems.",
    app_response:
      "It sounds like ensuring your colleague is fully prepared and trustworthy is key for you to feel comfortable setting this boundary. Considering the time constraints you're already facing, what specific strategies would be most realistic and effective for you to quickly and confidently assess their competence and build that necessary trust, and what would happen if you were still uncertain about their ability to handle things?",
  },
  {
    timestamp: '2025-03-15T08:05:56.309207',
    critic_prompt:
      "Well, I think the quickest way to assess their competence is to observe them in action. Perhaps I could delegate a small, less critical task to them and see how they handle it. That would give me a sense of their problem-solving skills and attention to detail. If there is a possibility, maybe have the colleague shadow me for a day, or part of a day, so they can directly see how the processes go in different scenarios. Another quick strategy is to quiz them on the documented protocols and procedures. Their answers would quickly reveal their level of understanding. \n\nBuilding trust is a bit trickier, but open and honest communication is key. I'd want to encourage them to ask questions and voice any concerns they have. This not only helps clarify things but also demonstrates their engagement and willingness to learn. \n\nNow, if, even after all of that, I was *still* uncertain about their ability to handle things during my family time, I'd probably postpone the 'official' launch of the 6-7 PM family hour. I'd continue to delegate smaller tasks and observe them, and maybe extend the shadowing period. In the meantime, I'd keep my phone nearby (though on silent!) during my family hour for *that* week as a temporary measure, just in case they needed to reach me for guidance. It wouldn't be ideal, but it would be a safety net while I built more confidence in their abilities, because I still want to be there for my family for the time I have specified. And I think with a bit of time and effort, I can get there.",
    app_response:
      "That sounds like a well-thought-out plan for assessing your colleague's competence and building trust. However, even with the documented procedures and shadowing, there might be situations that are difficult to anticipate. What are your biggest worries about the kinds of unexpected issues that could still arise during your family time, despite your best efforts to prepare your colleague, and how might those worries impact your ability to truly relax and be present with your family during that hour?",
  },
  {
    timestamp: '2025-03-15T08:06:14.544459',
    critic_prompt:
      "Well, I think my biggest worry is that some completely novel issue will arise \u2013 something outside of the documented protocols and beyond my colleague's experience. Maybe a system crashes, or a key client has an unexpected urgent request that requires immediate action, or something changes in our business and I need to adjust it and only I know. That's the kind of thing that keeps me up at night. \n\nIf something like that happened, even if my colleague was doing their best, I'd still feel a nagging sense of responsibility and anxiety. It would be hard to truly relax and be present with my family, knowing that there's a potential crisis brewing at work. I'd probably be mentally multitasking, trying to anticipate what might go wrong and how I'd handle it. That would definitely diminish the quality of my family time. But I think with proper planning and a bit of faith, I can at least mitigate that worry. It is something I know I can address with an action plan.",
    app_response:
      "That makes sense, and it's understandable to worry about those unforeseen issues. Thinking about those completely novel and potentially overwhelming scenarios, what personal resources or inner strengths do you feel you could draw upon to manage your anxiety and maintain some presence with your family, even amidst that uncertainty?",
  },
  {
    timestamp: '2025-03-15T08:06:34.552639',
    critic_prompt:
      "Well, I think my natural optimism and problem-solving skills would kick in. Even if a crisis arose, I'd try to approach it with a calm and solution-oriented mindset. I'd remind myself that I've handled difficult situations in the past, and I have the ability to figure things out. I'd also try to practice some mindfulness \u2013 focusing on the present moment and letting go of the need to control everything. Maybe even a quick breathing exercise to calm my nerves. And finally, I'd try to be kind to myself. To acknowledge that I'm doing my best and that it's okay to feel anxious. Self-compassion, I think, is key. It's about recognizing I am human and forgiving myself for not being perfect. I'd try to focus on enjoying the time with my family, even if there's a little worry in the back of my mind. I am hoping that I will be able to put all those things into practice.",
    app_response:
      'It sounds like you have a number of coping mechanisms ready to deploy if an unexpected work crisis interferes with your family time. Given that you anticipate needing to rely on these strategies, what specific aspect of putting them into practice feels most uncertain or challenging for you, and what would help you feel more confident in your ability to use them effectively in the moment?',
  },
  {
    timestamp: '2025-03-15T08:06:53.773183',
    critic_prompt:
      "That's a great idea about the visual reminders. It is important to be prepared in the moment. It seems like we have covered a lot of ground and came up with a good set of skills and approach that you can take to solve those problems. Do you feel there are any other areas that you wish to talk about? Or would you like to book our next session? FINAL_RATING: Good",
    app_response:
      "It sounds like you've developed some excellent strategies to prepare both yourself and your colleague. Given your worries about completely novel issues arising and impacting your ability to relax with your family, on a scale of 1 to 10, with 1 being 'not at all confident' and 10 being 'completely confident', how confident are you that you can successfully implement these strategies and truly disconnect during that hour, and what would need to happen to increase that number by just one point?",
  },
];

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentChatsSource = new BehaviorSubject<Chat[]>([]);
  currentChats$ = this.currentChatsSource.asObservable();

  constructor() {}

  getChats() {
    const c: Chat[] = [];
    for (const c_ of responses) {
      const c_to: Chat = {
        chatType: 'to',
        message: c_.critic_prompt,
        time: c_.timestamp,
        name: 'You',
      };
      const c_from: Chat = {
        chatType: 'from',
        message: c_.app_response,
        time: c_.timestamp,
        name: 'SAKSHI',
      };
      c.push(c_from);
      c.push(c_to);
    }
    this.currentChatsSource.next(c);
  }

  addChat(chat: Chat) {
    this.currentChatsSource.next([...this.currentChatsSource.value, chat]);
  }
}
