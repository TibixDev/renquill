<template>
    <div>
        <div
            id="project-dropper"
            v-if="!isInProject && !isCreatingProject"
            class="flex flex-col gap-12 items-center justify-center min-h-screen w-screen py-5 p-2 text-indigo-400"
        >
            <div class="gradient-bg absolute opacity-50 overflow-hidden -z-10">

            </div>
            <div class="flex flex-row items-center gap-5">
                <img src="/renquill.png" alt="Renquill Logo" class="w-20 h-20">
                <h1 class="text-5xl font-bold">Renquill</h1>
            </div>
            <h1 class="text-4xl font-semibold text-center">Prepare for awesome things!</h1>
            <div
                class="border-2 border-indigo-400
                       border-dashed py-24 px-12 rounded-md
                       flex items-center justify-center w-fit
                       cursor-pointer hover:brightness-90 duration-150"
                @click="callRpyOrProjectSelectDialog()"
                @drop="processRpyOrProjectDrop"
                @dragover="e => e.preventDefault()"
            >
                <p class="font-semibold select-none text-center">Select or drop rpy or project files here!</p>
            </div>
            <div v-if="savedProjects">
                <p class="text-center">Or get back to a previous project</p>
                <div class="flex flex-col gap-4 mt-10">
                    <div
                        class="cursor-pointer flex flex-row gap-3 items-center p-3 border-2
                        rounded-md border-indigo-400 bg-indigo-400/10 hover:brightness-110
                        transition duration-150 group"
                        v-for="(proj, k) in savedProjects" :key="k"
                        @click="loadProject(proj)"
                    >
                        <svg class="fill-indigo-400 w-20 h-20 text-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M4 20q-.825 0-1.413-.588T2 18V6q0-.825.588-1.413T4 4h5.175q.4 0 .763.15t.637.425L12 6h8q.825 0 1.413.588T22 8v10q0 .825-.588 1.413T20 20H4Z"/></svg>
                        <p class="w-full">{{ proj }}</p>
                        <button class="invisible group-hover:visible" @click="deleteProject(proj)">
                            <svg class="w-8 h-8 fill-red-500 hover:fill-red-600 transition duration-150" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="m8.4 17l3.6-3.6l3.6 3.6l1.4-1.4l-3.6-3.6L17 8.4L15.6 7L12 10.6L8.4 7L7 8.4l3.6 3.6L7 15.6L8.4 17Zm3.6 5q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="new-project-wizard" v-if="isCreatingProject" class="flex flex-col gap-12 items-center justify-center h-screen w-screen p-2">
            <div class="p-6 bg-neutral-800 rounded-md">
                <h1 class="text-3xl font-semibold">New Project Wizard</h1>
                <div class="mt-5 flex flex-col gap-5">
                    <div>
                        <label for="project-name">Project Name</label><br>
                        <input
                            type="text"
                            id="project-name"
                            name="project-name"
                            class="rounded-md bg-neutral-600 p-2 w-full"
                            placeholder="Katawa Shoujo: Re-Engineered ITA"
                            v-model="projectData.project.friendlyName"
                        >
                    </div>
                    <div>
                        <label for="project-export">Project Export Name</label><br>
                        <input
                            type="text"
                            id="project-export"
                            name="project-export"
                            class="rounded-md bg-neutral-600 p-2 w-full"
                            placeholder="ksre_ita"
                            v-model="projectData.project.name"
                        >
                    </div>
                    <div>
                        <label for="detected-language">Detected Language</label><br>
                        <input
                            type="text"
                            id="detected-language"
                            name="detected-language"
                            class="rounded-md bg-neutral-600 p-2 w-full text-neutral-3  00"
                            placeholder="hungarian"
                            v-model="projectData.project.language"
                            disabled
                        >
                    </div>
                    <div>
                        <p>Script Collection</p>
                        <div class="font-mono h-48 p-2 bg-neutral-700 rounded-md overflow-y-auto">
                            <p v-for="file of Object.keys(projectData).filter(e => e != 'project')">
                                {{ file }} - {{ projectData[file].length }} units
                            </p>
                        </div>
                    </div>
                    <div class="text-right space-x-3">
                        <button @click="finalizeProject()" class="tl-button">Create</button>
                        <button @click="cancelProjectCreation()" class="tl-button-ol">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="app-view" v-if="isInProject && !isCreatingProject" class="relative flex flex-row">
            <div id="sidebar-opener" class="fixed left-0 top-0 block lg:hidden shadow-sm">
                <button v-if="!sidebarOpen" class="bg-neutral-600/50 backdrop-blur-md p-2 rounded-br-xl" @click="sidebarOpen = true">
                    <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18v-2h18v2H3Zm0-5v-2h18v2H3Zm0-5V6h18v2H3Z"/></svg>
                </button>
            </div>
            <div
                id="sidebar"
                v-if="sidebarOpen"
                class="bg-neutral-800 z-10 fixed lg:relative flex flex-col w-full lg:w-[40vw] xl:w-[25vw] h-screen max-h-screen overflow-y-auto"
            >
                <div class="flex flex-row bg-neutral-700 items-center">
                    <img src="/renquill.png" alt="Renqull Logo" class="w-8 h-8 mx-3">
                    <button :class="activeTab === Tabs.Files ? 'bg-neutral-800' : ''" @click="activeTab = Tabs.Files" class="px-3 py-4">Files</button>
                    <button :class="activeTab === Tabs.Project ? 'bg-neutral-800' : ''" @click="activeTab = Tabs.Project" class="px-3 py-4">Project</button>
                    <button :class="activeTab === Tabs.About ? 'bg-neutral-800' : ''" @click="activeTab = Tabs.About" class="px-3 py-4">About</button>
                    <button class="px-3 py-4 ml-auto lg:hidden" @click="sidebarOpen = false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="m8.4 17l3.6-3.6l3.6 3.6l1.4-1.4l-3.6-3.6L17 8.4L15.6 7L12 10.6L8.4 7L7 8.4l3.6 3.6L7 15.6L8.4 17Zm3.6 5q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                    </button>
                </div>
                <div id="tab-files" v-if="activeTab === Tabs.Files"
                    class="hover:bg-neutral-600 p-3 transition duration-150 cursor-pointer"
                    :class="selectedFile === i ? 'bg-neutral-600' : ''"
                    v-for="i in Object.keys(projectData).filter(e => e != 'project')"
                    @click="currentPage = 0; selectedFile = i"
                >
                    <h1 class="font-semibold text-xl">{{ i }}</h1>
                    <p class="text-neutral-300">
                        {{ projectData[i].length }} units |
                        {{ ((countElements(projectData[i], e => isTranslated(e.translation)) / projectData[i].length) * 100).toFixed(1) }}%
                        translated
                    </p>
                </div>
                <div id="tab-exports" v-if="activeTab === Tabs.Project" class="px-2 py-4">
                    <div class="flex flex-col gap-3">
                        <button class="w-full py-2 bg-neutral-500 hover:bg-neutral-600 transition duration-150" @click="saveProject()">Save Project</button>
                        <button class="w-full py-2 bg-neutral-500 hover:bg-neutral-600 transition duration-150" @click="logProject()">Debug Log</button>
                        <button class="w-full py-2 bg-neutral-500 hover:bg-neutral-600 transition duration-150" @click="exportProject()">Download Project File</button>
                        <button class="w-full py-2 bg-neutral-500 hover:bg-neutral-600 transition duration-150" @click="compileRpyBundle()">Export RenPy Bundle</button>
                        <button class="w-full py-2 bg-neutral-500 hover:bg-neutral-600 transition duration-150" @click="closeProject()">Close Project</button>
                    </div>
                </div>
                <div id="tab-about" v-if="activeTab === Tabs.About" class="p-2 flex flex-col justify-between h-full">
                    <div id="renquill-info">
                        <div class="flex flex-row items-center gap-3">
                            <img class="w-10 h-10" src="/renquill.png" alt="Renquill Logo">
                            <h1 class="text-indigo-400 font-semibold text-4xl my-4">Renquill</h1>
                        </div>
                        <p class="font-mono mb-5 text-gray-400">Renquill v{{ APP_VER }} {{ IS_PROD ? 'PROD' : 'DEV' }}</p>
                        <p class="mb-8 whitespace-normal">Renquill is an open-source app that helps you translate your<br> RenPy visual novels.</p>
                        <div id="contribute">
                            <h1 class="font-semibold text-2xl my-4">Contribute</h1>
                            <a
                                href="https://github.com/TibixDev/Renquill"
                                target="_blank"
                                class="w-max flex flex-row items-center justify-center gap-3 bg-black py-2 px-4 rounded-md border-2 generic-hover"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"/></svg>
                                <span class="font-semibold">GitHub</span>
                            </a>
                        </div>
                    </div>
                    
                    <div id="renquill-notice">
                        <p class="text-[18px] text-gray-400 font-bold">Copyright (c) 2024 TibixDev</p>
                        <p class="text-[18px] text-gray-400 ">Licensed under the MIT license</p>
    
                    </div>


                </div>
            </div>
            <div id="tl-view" v-if="unitsWithinFile" class="p-5 h-screen max-h-screen overflow-y-auto w-full">
                <h1 class="font-semibold text-4xl">Currently translating</h1>
                <p class="text-indigo-400 font-bold text-2xl">{{ projectData.project.friendlyName }} > {{ selectedFile }}
                    <span class="text-white font-semibold">into {{ projectData.project.language }}</span>
                </p>
                <div id="tl-panel" class="space-y-4 mt-12">
                    <div class="pagination flex flex-row gap-3 items-center">
                        <button @click="currentPage--" :disabled="currentPage === 0" class="hover:brightness-90 transition duration-200 disabled:grayscale">
                            <svg class="fill-indigo-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M11.8 13H15q.425 0 .713-.288T16 12q0-.425-.288-.713T15 11h-3.2l.9-.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275l-2.6 2.6q-.3.3-.3.7t.3.7l2.6 2.6q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7l-.9-.9Zm.2 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                        </button>
                        <p class="font-bold">Page {{ currentPage + 1 }} / {{ pagesWithinFile }}</p>
                        <button @click="currentPage++" :disabled="currentPage === pagesWithinFile - 1" class="hover:brightness-90 transition duration-200 disabled:grayscale">
                            <svg class="fill-indigo-400 rotate-180" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M11.8 13H15q.425 0 .713-.288T16 12q0-.425-.288-.713T15 11h-3.2l.9-.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275l-2.6 2.6q-.3.3-.3.7t.3.7l2.6 2.6q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7l-.9-.9Zm.2 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                        </button>
                    </div>
                    <div v-for="(tl, k) of unitsWithinFile.slice(currentPage * UNITS_PER_PAGE, (currentPage + 1) * UNITS_PER_PAGE)">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="bg-neutral-700 p-2 rounded-md">
                                <p class="font-mono text-neutral-400 text-md">{{ tl.location }}</p>
                                <p v-for="line in tl.orig.split('\n')">
                                    {{ line }}
                                </p>
                            </div>
                            <div 
                                class="p-2 rounded-md flex flex-col"
                                :class="isTranslated(tl?.translation) ? 'bg-green-500/30' : 'bg-red-500/30'"
                            >
                                <p class="font-mono text-neutral-400 text-md">{{ tl.location }}</p>
                                <textarea
                                    class="text-white bg-transparent w-full h-full"
                                    spellcheck="false"
                                    v-model.lazy="tl.translation"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="pagination flex flex-row gap-3 items-center">
                        <button @click="currentPage--" :disabled="currentPage === 0" class="hover:brightness-90 transition duration-200 disabled:grayscale">
                            <svg class="fill-indigo-400" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M11.8 13H15q.425 0 .713-.288T16 12q0-.425-.288-.713T15 11h-3.2l.9-.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275l-2.6 2.6q-.3.3-.3.7t.3.7l2.6 2.6q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7l-.9-.9Zm.2 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                        </button>
                        <p class="font-bold">Page {{ currentPage + 1 }} / {{ pagesWithinFile }}</p>
                        <button @click="currentPage++" :disabled="currentPage === pagesWithinFile - 1" class="hover:brightness-90 transition duration-200 disabled:grayscale">
                            <svg class="fill-indigo-400 rotate-180" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M11.8 13H15q.425 0 .713-.288T16 12q0-.425-.288-.713T15 11h-3.2l.9-.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275l-2.6 2.6q-.3.3-.3.7t.3.7l2.6 2.6q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7l-.9-.9Zm.2 9q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div v-else class="p-5 h-screen max-h-screen overflow-y-auto w-full">
                <h1 class="font-semibold text-4xl">{{ projectData.project.friendlyName }}</h1>
                <h1>Click a file to begin translating</h1>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, inject } from "vue";
import { $ref } from "vue/macros";
import { downloadObjectAsJson } from "../helpers/download";
import { get, set, del } from 'idb-keyval';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// SweetAlert
const swal = inject("$swal") as Function;

// Types
enum Tabs {
    Files,
    Project,
    About
}

enum BlockType {
    StrBlock,
    HashBlock
}

type TranslationUnit = {
    type: BlockType,
    location: string,
    language?: string,
    orig: string,
    translation?: string
    hash?: string
}

type ProjectMeta = {
    project: {
        friendlyName: string,
        name: string,
        version: number,
        language: string
    }
}
type Project = ProjectMeta | (ProjectMeta & Record<string, TranslationUnit>);

// Logic
const baseProject: Project = {
    project: {
        friendlyName: "Unknown Project",
        name: "unk_export_lang",
        version: 0.1,
        language: ""
    }
}
let projectData = $ref<Project>({
    ...baseProject
});

// Constants
const UNITS_PER_PAGE = 50;
const APP_VER = __APP_VERSION__;
const COMMIT_HASH = __COMMIT_HASH__;
const IS_PROD = import.meta.env.PROD;

// Reactive
const isInProject = computed(() => Object.keys(projectData).filter(e => e != 'project').length > 0);
const unitsWithinFile = computed(() => projectData[selectedFile] as TranslationUnit[]);
const pagesWithinFile = computed(() => Math.ceil(unitsWithinFile.value.length / UNITS_PER_PAGE));
let activeTab = $ref<Tabs>(Tabs.Files);
let selectedFile = $ref(null);
let isCreatingProject = $ref(false);
let savedProjects = $ref(null);
let currentPage = $ref(0);
let sidebarOpen = $ref(true);

onMounted(async () => {
    savedProjects = await get("projects");
    console.log(savedProjects);
})


function logProject() {
    console.log(projectData);
}

/**
 * Processes the file drop event for .rpy or .json files, the former
 * initiating a new project, the latter used for importing an existing
 * project into the application
 * @param event 
 */
function processRpyOrProjectDrop(event) {
    console.log(`[FileDrop] Detected dropped file...`);
    event.preventDefault();
    if (!event.dataTransfer.items) return;

    const jsonFile = [...event.dataTransfer.items].find(item => item.kind === 'file' && item.getAsFile().name.split(".")[1] == "json");
    const rpyFile = [...event.dataTransfer.items].find(item => item.kind === 'file' && item.getAsFile().name.split(".")[1] == "rpy");
    
    // If we imported a json file, we check if its a valid project file created by the app
    if (jsonFile) {
        const file = jsonFile.getAsFile();
        console.log("[FileDrop] Found .json project file %s", file.name);
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContents = e.target.result;
            importProject(fileContents);
        };
        reader.readAsText(file);
    } else if (rpyFile) {
        // Otherwise we check if we imported .rpy files, so we move onto project creation
        for (let item of event.dataTransfer.items) {
            if (item.kind !== 'file') continue;
            const file = item.getAsFile();
            const fileExt = file.name.split(".")[1];
            if (fileExt != "rpy") continue;
            console.log("[FileDrop] Found valid .rpy file %s", file.name);
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContents = e.target.result;
                const blocks = rpyToBlocks(file.name, fileContents.toString());
                const units = convertBlocksToUnits(blocks);
                const language = blocks[0].find(e => e.includes("translate ")).split(" ")[1];
                if (!projectData.project.language && language) {
                    console.log("[Reader] Language: %s", language);
                    projectData.project.language = language;
                }
                projectData[file.name] = units;
                console.log(units);
            };
            reader.readAsText(file);
        }
        isCreatingProject = true;
    }

}

function callRpyOrProjectSelectDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => { 
        processRpyOrProjectSelect(e);
    }
    input.click();
}

/**
 * Processes the file select event for .rpy or .json files, the former
 * initiating a new project, the latter used for importing an existing
 * project into the application
 * @param event 
 */
function processRpyOrProjectSelect(event) {
    console.log(`[FileSelect] Detected dropped file...`);
    event.preventDefault();
    if (!event.target.files) return;

    const jsonFile = [...event.target.files].find(item => item.name.split(".")[1] == "json");
    const rpyFile = [...event.target.files].find(item => item.name.split(".")[1] == "rpy");
    
    // If we imported a json file, we check if its a valid project file created by the app
    if (jsonFile) {
        const file = jsonFile;
        console.log("[FileSelect] Found .json project file %s", file.name);
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileContents = e.target.result;
            importProject(fileContents);
        };
        reader.readAsText(file);
    } else if (rpyFile) {
        // Otherwise we check if we imported .rpy files, so we move onto project creation
        for (let item of event.target.files) {
            const file = item;
            const fileExt = file.name.split(".")[1];
            if (fileExt != "rpy") continue;
            console.log("[FileSelect] Found valid .rpy file %s", file.name);
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileContents = e.target.result;
                const blocks = rpyToBlocks(file.name, fileContents.toString());
                const units = convertBlocksToUnits(blocks);
                const language = blocks[0].find(e => e.includes("translate ")).split(" ")[1];
                if (!projectData.project.language && language) {
                    console.log("[Reader] Language: %s", language);
                    projectData.project.language = language;
                }
                projectData[file.name] = units;
                console.log(units);
            };
            reader.readAsText(file);
        }
        isCreatingProject = true;
    }

}

/**
 * Transforms .rpy files into small blocks, where one block is one chunk
 * to be translated, this can later be converted into translation units
 * @param name - The .rpy file name
 * @param contents - The file contents
 */
function rpyToBlocks(name: string, contents: string): string[][] {
    console.log("[ProcessRpyFile] File: %s | Len: %d", name, contents.length)
    // I fucking despise Windows
    contents = contents.replaceAll("\r\n", "\n");


    const lines = contents.split("\n");

    // Transform into blocks
    let blockStore = [];
    let currentBlockPtr = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if ((line.includes("translate " ) && !line.startsWith(" ")) || i === lines.length - 1) {
            // console.log("[ProcessRpyFile] New Block Ptr: %d", i);
            if (!currentBlockPtr) {
                currentBlockPtr = i;
                continue;
            }
            const blockStartPtr = currentBlockPtr;
            currentBlockPtr = i;
            const block = lines
                .slice(blockStartPtr - 1, currentBlockPtr - 1)
                .filter(e => e != "\n" && e != "")
                .map(e => e.trimStart())
            blockStore.push(block);
        }
    }
    console.log("[ProcessRpyFile] Blocks", blockStore)
    console.log("[ProcessRpyFile] Total blocks: %d", blockStore.length)
    return blockStore;
}

/**
 * Converts blocks to translation units, used internally in the app
 * and project structure for translation. For exporting, these units
 * need to be rebuilt into new .rpy files
 * @param blocks The blocks to be converted
 */
function convertBlocksToUnits(blocks: string[][]) {
    const unitStore: TranslationUnit[] = [];
    for (let block of blocks) {
        // console.log("Processing block %d...", blocks.indexOf(block), block)
        const blockType = block.join("\n").includes("strings:") ? BlockType.StrBlock : BlockType.HashBlock;
        // console.log("Block %d is of type %s", blocks.indexOf(block), ["StrBlock", "HashBlock"][blockType])
        if (blockType === BlockType.HashBlock) {
            const location = block[0];
            const hash = block[1].split(" ")[2];
            const orig = block.slice(2).filter(e => e.startsWith("# ")).map(e => e.split("# ")[1]).join("\n");
            const translation = block.slice(2).filter(e => !e.startsWith("# ")).join("\n");
            const unit: TranslationUnit = { type: BlockType.HashBlock, location, orig, translation, hash }
            unitStore.push(unit);
        } else if (blockType === BlockType.StrBlock) {
            // const language = block[0].split(" ")[1];
            for (let i = 1; i < block.length; i += 3) {
                const location = block[i];
                const RENQUILL_MARKER_OLD = "__RENQUILL_MARKER_OLD__";
                const RENQUILL_MARKER_NEW = "__RENQUILL_MARKER_NEW__";
                const orig = block[i+1].replace("old", RENQUILL_MARKER_OLD).split(`${RENQUILL_MARKER_OLD} `)[1];
                const translation = block[i+2].replace("new", RENQUILL_MARKER_NEW).split(`${RENQUILL_MARKER_NEW} `)[1];
                const unit: TranslationUnit = { type: BlockType.StrBlock, location, orig, translation }
                unitStore.push(unit);
            }
        }
    }
    console.log("[ConvertBlocks] Successfully converted all blocks into %d translation units!", unitStore.length)
    return unitStore;
}

/**
 * Export the current project the user is working on
 */
function exportProject() {
    console.log("[SaveProject] Saving project '%s', ver. %f", projectData.project.name, projectData.project.version);
    downloadObjectAsJson(projectData, `${projectData.project.name}_${Date.now()}`)
}

/**
 * Imports an existing project in our own format
 * @param data The JSON data for the project
 */
function importProject(data) {
    const proj = JSON.parse(data);
    if (!proj.project || !proj.project.name || !proj.project.version) {
        return console.error("[ImportProject] Invalid project provided, returning early...");
    };
    console.log("[ImportProject] Project '%s', ver. %f", proj.project.name, proj.project.version);
    console.log("[ImportProject] Imported valid project with %d keys", Object.keys(proj).length);
    projectData = proj;

}

/**
 * Cancels the project creation process and
 * resets the project data
 */
function cancelProjectCreation() {
    isCreatingProject = false;
    projectData = { ...baseProject };
}

/**
 * Finalizes the project creation process
 */
function finalizeProject() {
    isCreatingProject = false;
}

/**
 * Saves the current project
 */
async function saveProject() {
    const saved = await get("projects");
    if (!saved) {
        await set("projects", [projectData.project.friendlyName]);
    } else if (!saved.includes(projectData.project.friendlyName)) {
        await set("projects", [...saved, projectData.project.friendlyName]);
    }
    const unrefProj = JSON.parse(JSON.stringify(projectData));
    await set(projectData.project.friendlyName, unrefProj);
    console.log("[SaveProject] Successfully saved %s", projectData.project.friendlyName);
    swalNotification(`Successfully saved '${projectData.project.friendlyName}'`);
}

/**
 * Loads a project with the specified key
 * @param key The project name
 */
async function loadProject(key) {
    projectData = await get(key);
}

/**
 * Close the current project and return to the title screen
 */
async function closeProject() {
    projectData = { ...baseProject };
    selectedFile = null;
    savedProjects = await get("projects");
    activeTab = Tabs.Files;
}

/**
 * Deletes a specific project from disk
 * @param key The project name
 */
async function deleteProject(key) {
    console.log("[DeleteProject] Deleting '%s'", key);
    await del(key);
    savedProjects = savedProjects.filter(e => e != key);
    await set("projects", JSON.parse(JSON.stringify(savedProjects)));
}

/**
 * Count array elements matching a specific condition
 * Imagine `filter(...).length` but faster and lighter on memory
 */
function countElements(array, condition) {
  let count = 0;
  for (let i = 0; i < array.length; i++) {
    if (condition(array[i])) {
      count++;
    }
  }
  return count;
}

/**
 * Decides whether or not a string is considered translated
 * @param str 
 */
function isTranslated(str: string) {
    return !str.includes("\"\"") && str !== "";
}

/**
 * Compiles the rpy bundle for the current project
 */
function compileRpyBundle() {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');
    const header = `# TODO: Translation updated at ${formattedDate}\n# Generated by Renquill\n\n`;
    console.log(header);
    let allContent = {};

    // Compile step
    for (let rpyFile of Object.keys(projectData).filter(e => e != "project")) {
        console.log("[CompileRpyBundle] Compiling bundle for '%s'", rpyFile);
        let fileContent = `${header}`;

        // Hash Units
        const hashUnits = (projectData[rpyFile] as TranslationUnit[]).filter(e => e.type === BlockType.HashBlock);
        let hashBlocks = [];
        for (let unit of hashUnits) {
            let block = "";
            block += `${unit.location}\n`;
            block += `translate ${projectData.project.language} ${unit.hash}\n\n`;
            block += `    ${unit.orig.split('\n').map(e => `# ${e}`).join('\n    ')}\n`;
            block += `    ${unit.translation.split('\n').join('\n    ')}\n\n`;
            hashBlocks.push(block);
        }
        fileContent += hashBlocks.join("");

        // String Units
        const strUnits = (projectData[rpyFile] as TranslationUnit[]).filter(e => e.type === BlockType.StrBlock);
        if (strUnits.length) {
            let strBlock = `translate ${projectData.project.language} strings:\n\n`;
            for (let unit of strUnits) {
                strBlock += `    ${unit.location}\n`;
                strBlock += `    old ${unit.orig}\n`;
                strBlock += `    new ${unit.translation}\n\n`;
            }
            fileContent += strBlock;
        }

        allContent[rpyFile] = fileContent;
    }

    // Archive step
    const zip = new JSZip();
    for (let rpyFile of Object.keys(allContent)) {
        zip.file(rpyFile, allContent[rpyFile]);
    }
    zip.generateAsync({ type: 'blob' })
        .then(function (content) {
            saveAs(content, `${projectData.project.name}_bundle.zip`);
        });
    
    swalNotification(`Successfully compiled '${projectData.project.friendlyName}'', please check the downloaded .zip file.`);
}

/**
 * Produces a SweetAlert notification
 * @param msg - The message
 * @param icon - The icon
 */
function swalNotification(msg, icon = 'success') {
    swal({
        icon,
        toast: true,
        title: msg,
        position: "top-right",
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
    });
}
</script>

<style scoped>
.tl-button {
    @apply py-3 rounded-md bg-indigo-500 w-fit px-6 hover:brightness-90 transition duration-150;
}

.tl-button-ol {
    @apply py-3 rounded-md text-indigo-500 border-2 border-indigo-500 w-fit px-6 hover:brightness-90 transition duration-150;
}

.gradient-bg {
    width: 440px; height: 440px; border-radius: 16rem; background: radial-gradient(49.19% 88.28% at 72.99% 113.54%, rgba(93, 227, 236, 0.73) 0%, rgba(93, 227, 236, 0.1679) 59.78%, rgba(93, 227, 236, 0) 100%), linear-gradient(54.57deg, #862AB1 8.59%, rgba(185, 91, 230, 0) 80.49%), radial-gradient(118.75% 118.75% at 96.65% 74.22%, #308EE6 0%, rgba(48, 158, 230, 0) 73.91%), radial-gradient(114.51% 155.86% at 9.82% 10.94%, rgba(255, 85, 85, 0.7) 0%, rgba(255, 85, 85, 0.147) 61.98%, rgba(255, 85, 85, 0) 100%, #F2F5FA); background-blend-mode: hard-light,darken,normal,normal,normal,normal; filter: blur(62px);
}
</style>