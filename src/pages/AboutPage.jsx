import React from 'react';

const AboutPage = () => {
return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">About Me</h1>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">                <img 
                    src="./image/0.png" 
                    alt="Profile" 
                    className="mx-auto mb-4 p-2 w-32 h-32 rounded-full bg-gray-700 object-cover"
                />
                <h2 className="text-2xl font-semibold text-center mb-2">F0rD</h2>
                <p className="text-gray-400 text-center mb-6">Guild Task Assignment Tool Creator</p>
                
                <div className="space-y-4">
                    <p>
                        Welcome to my Guild Task Assignment Tool for MapleStory M! I created this tool to help guild leaders 
                        efficiently manage and distribute tasks among guild members.
                    </p>
                    <p>
                        As an avid MapleStory M player, I noticed that guild management could be time-consuming, 
                        especially when it comes to assigning tasks and calculating GP allocations. This tool aims to 
                        simplify that process with a user-friendly interface and helpful automation features.
                    </p>
                    <p>
                        The tool allows you to import member lists, assign members to different tiers, track GP usage, 
                        and even provides an auto-assignment feature to make the process even faster.
                    </p>

                    <p>And i hope this game will update summary page in-game</p>
                </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                <p className="mb-4">
                    If you have any questions, feedback, or suggestions for improving this tool, feel free to reach out:
                </p>                <ul className="space-y-2 text-gray-300 mb-6">
                    <li className="flex items-center gap-2">
                        <span className="text-blue-400">📧</span> Email: peerasakt1@gmail.com
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-blue-400">💬</span> Discord: .f0rd
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-blue-400">🐱</span> GitHub: 
                        <a href="https://github.com/FordenHillson" 
                           className="text-blue-400 hover:underline" 
                           target="_blank" 
                           rel="noopener noreferrer">FordenHillson</a>
                    </li>
                </ul>
                
                <p className="text-lg font-semibold text-purple-300 mt-4 mb-2">Find me in-game</p>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                        <span className="text-yellow-500">🎮</span> MapleStory GMS Reboot kronos: F0rD4265 Danw Warrior
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-yellow-500">📱</span> MapleStory M Global Asia 2 Scania: F0rD4224 Paladin
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-yellow-500">📱</span> Maplestory M Korea Scania: F01Erel Erel
                    </li>
                </ul>
            </div>
        </div>
    </div>
);
};

export default AboutPage;
