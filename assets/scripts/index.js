const contactFormObj = {
    name: '',
    email: '',
    purpose: ''
};
var myTerminal = new Terminal(10);
terminal.appendChild(myTerminal.html);
myTerminal.setTextSize('20px');
myTerminal.setTextColor('#00FF00');
myTerminal.blinkingCursor(true);
myTerminal.setHeight(window.innerHeight);
const date = new Date();
myTerminal.print('==> Your session started at ' + date.toDateString() + ' ' + date.toLocaleTimeString());
myTerminal.print("==> Welcome to the terminal of Kuldeep Singh Rai! :)");
myTerminal.print("==> This terminal will give all info about me.");
myTerminal.print("==> Hope You like it :)");
myTerminal.print('--------------------------------------------------------')
myTerminal.print('Enter `help` to list the available commands');
myTerminal.input('', command => {
        handleInput(command)
});

function switchMode() {
    window.open('index.html', "_self");
}

const handleInput  = command => {
    if (command.length) {
        command = command.toLowerCase();
        if (command === 'man') { 
        } else if (command === 'help' || command === 'ls') {
            handleHelp();
        } else if (command === 'about'){
            showAbout();
        } else if (command === 'git checkout github'){
            window.open('https://github.com/kuldeepsinghrai');
        } else if (command === 'docs'){
            handleDocs();
        } else if (command === 'cv'){
            downloadResume();
        } else if (command === 'work'){
            showWork();
        } else if (command === 'projects'){
            //showProject();
        } else if (command === 'education'){
            showEducation();
        } else if (command === 'achievements'){
            //showAchievements();
        } else if (command === 'skills'){
            showSkills();
        } else if (command === 'contact'){
            showContact();
        } else if (command === 'exit') {
            myTerminal.print('> Thank You for visiting my website thanks:)')
        } else if (command === 'clear') {
            myTerminal.clear();
        } else {
            handleError(command);
        }
    } else {
        myTerminal.beep();
    }
    if (command !== 'exit' && command !== 'contact' && command !== 'docs') {
        myTerminal.input('', command2 => {
            handleInput(command2);
        });
    }
}
const showAbout = () => {
    myTerminal.print('==> I am Kuldeep Singh Rai');
   
}

const showSkills = () => {
    myTerminal.print('--------------------------------------------------------');
    myTerminal.print('******************** MY SKILLS **********************');
    myTerminal.print('--------------------------------------------------------');
    const skills = [
        {name: "Android Development"},
        {name: "Java"},
        {name: 'Git + Github'}
    ]
    skills.forEach((element) => {
        myTerminal.print(` > ${element.name}`);
    });
    myTerminal.print('========================================================');
}

const showContact = () => {
    myTerminal.print('Wanna contact me :)');
    myTerminal.print('> +91 7982539642');
    myTerminal.print('> imkuldeepsinghrai@gmail.com');
    myTerminal.print('> https://github.com/kuldeepsinghrai');
    myTerminal.print('> https://linkedin.com/in/kuldeepsinghrai');
    myTerminal.input('Want to the fill Contact form [y/n]', confirm => {
        handleContactForm(confirm);
    })
}

const handleContactForm = confirm => {
    if (confirm.toLowerCase() === 'y') {
        myTerminal.input('Enter your name ', name => {
            contactFormObj.name = name;
            myTerminal.input('Email Id', email => {
                contactFormObj.email = email;
                myTerminal.input('Purpose of contact', purpose => {
                    contactFormObj.purpose = purpose;
                    myTerminal.print('----------------------------------------------------------');
                    myTerminal.print('Thanks for filling the form you will get in contact soon:)');
                    myTerminal.input('', command2 => {
                        handleInput(command2);
                    });
                });
            });
        });
    } else if (confirm.toLowerCase() === 'n') {
        myTerminal.print('no worries you can fill it later :)');
        myTerminal.print('--------------------------------------------------------');
        myTerminal.input('', command2 => {
            handleInput(command2);
        });
    } else {
        myTerminal.input('Invalid selection Please select a valid option', confirm => {
            handleContactForm(confirm)
        });
    }
}

const handleHelp = () => {
    myTerminal.print('==> Hey, Thanks for using Terminal :)');
    myTerminal.print('==> The available command in my terminal are :');
    const commands = [
        {name: 'about' },
        {name: 'skills'},
        {name: 'work'},
        {name: 'education'},
        {name: 'contact'},
        {name: 'CV'},
        {name: 'git checkout github'},
        {name: 'clear'},
        {name: 'help'},
        {name: 'exit'},
    ]
    commands.forEach((element) => {
        myTerminal.print(` > ${element.name}`);
    });
}

const handleError = (command) => {
    myTerminal.print('`' + command + '` is not recognised as a valid command ');
    myTerminal.print('use `help` to know more about commands');
}

const showWork = () => {
    const workExp = [
        {
            name : '',
            time: '',
            post: '',
            work: ''
        },
       
    ]
    myTerminal.print('--------------------------------------------------------');
    myTerminal.print('******************** MY WORK **********************');
    myTerminal.print('--------------------------------------------------------');
    for (let i = 0 ; i < workExp.length; i++) {
        myTerminal.print(`> ${workExp[i].post}`);
        myTerminal.print(`> ${workExp[i].name}`);
        myTerminal.print(`> ${workExp[i].time}`);
        myTerminal.print(`> ${workExp[i].work}`);
        myTerminal.print('========================================================');
    }
}

const showEducation = () => {
    const education = [
        {
            name: 'BCA',
            cgpa: '',
            school: 'School name',
            year: '2021-2024'
        },
        
    ];
    myTerminal.print('--------------------------------------------------------');
    myTerminal.print('******************** MY EDUCATION **********************');
    myTerminal.print('--------------------------------------------------------');
    for (let i = 0 ; i < education.length; i++) {
        myTerminal.print(`> ${education[i].name}   ( ${education[i].year} )`);
        myTerminal.print(`> ${education[i].school}  ( ${education[i].cgpa} )`);
        myTerminal.print('========================================================');
    }
}
const showProject = () => {

    const projects = [
        {
            name: 'Project Name',
            image: '../../img/projects/Builder Design.png',
        }, 
    ];

    myTerminal.print('-----------------------------------------------------------');
    myTerminal.print('********************** MY PROJECTS ************************');
    myTerminal.print('-----------------------------------------------------------');
    for(let i = 0; i < projects.length; i=i+3) {
        const temp = Array(20).fill('\xa0').join('');
        myTerminal.print(
            `${projects[i].name} 
            ${temp.substr(0, 20 - projects[i].name.length)}
            ${projects[i + 1].name}
            ${temp.substr(0, 20 - projects[i+1].name.length)}
            ${projects[i + 2].name}`);
    }
}

const showAchievements = () => {
    const achievements = [
        {
            name: 'Achievement title here',
            about: 'Achievement subtitle here'
        },
       
    ];
    myTerminal.print('-----------------------------------------------------------');
    myTerminal.print('******************** MY ACHIEVEMENTS **********************');
    myTerminal.print('-----------------------------------------------------------');
    for (let i = 0 ; i < achievements.length; i++) {
        myTerminal.print(`> ${achievements[i].name} `);
        myTerminal.print(`> ${achievements[i].about}`);
        myTerminal.print('===========================================================');
    }
}

const downloadResume = () => {
    window.open('https://linkedin.com/in/kuldeepsinghrai');
}