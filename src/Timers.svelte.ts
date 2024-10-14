import ICAL from "ical.js";

export type Time = {
    hours: number;
    minutes: number;
    seconds: number;
};
export type Lessons = {
    summary: string;
    startDate: Date;
    endDate: Date;
};
export type Timer = {
    name: string;
    starts: boolean; // If it doesn't start, it ends.
    time: Time;
};

class Timers {
    #icalUrl?: string;
    lessons: Lessons[] = [];
    private handlers: ((timers: Timer[]) => void)[] = ([]);
    private updateInterval: number = 0;
    private timerInterval: number = 0;

    get icalUrl(): string | undefined { return this.#icalUrl };
    set icalUrl(value: string) {
        this.updateLessons(value);
        this.#icalUrl = value;
    }

    constructor(icalUrl?: string) {
        this.#icalUrl = icalUrl;
        this.updateLessons()
    }
    async updateLessons(icalUrl?: string) {
        const url = icalUrl || this.icalUrl;
        if (!url) return;

        let vevents: ICAL.Component[];
        try {
            const response = await fetch(url);
            const text = await response.text();
            vevents = new ICAL.Component(ICAL.parse(text)).getAllSubcomponents("vevent");
        } catch (error) {
            console.error(error);
            alert(error);
            throw new Error(`Something went wrong while fetching and parsing the calendar: ${error}`);
        }
        this.lessons = vevents.map((event) => {
            const vevent = new ICAL.Event(event);
            return {
                summary: vevent.summary,
                endDate: vevent.endDate.toJSDate(),
                startDate: vevent.startDate.toJSDate(),
            };
        });
        alert(this.lessons)

        clearInterval(this.updateInterval)
        this.updateInterval = setInterval(() => {
            this.updateLessons()
        }, 1000 * 60 * 5)
    }
    getTimers(): Timer[] {
        const now = new Date();
        return this.lessons
            .filter((lesson) => lesson.startDate.toDateString() === now.toDateString())
            .map((lesson) => {
                const isInLesson = now >= lesson.startDate && now <= lesson.endDate;
                const targetDate = isInLesson ? lesson.endDate : lesson.startDate;
                return {
                    name: lesson.summary,
                    starts: !isInLesson,
                    time: {
                        hours: targetDate.getHours() - now.getHours(),
                        minutes: targetDate.getMinutes() - now.getMinutes(),
                        seconds: (targetDate.getSeconds() - now.getSeconds() + 60) % 60,
                    },
                };
            });
    }

    addCountdownHandler(handler: (timers: Timer[]) => void) {
        this.handlers.push(handler);

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const timers = this.getTimers();
            this.handlers.forEach((handler) => handler(timers));
        }, 1000);

    }
    removeCountdownHandler(handler: (timers: Timer[]) => void) {
        this.handlers = this.handlers.filter((h) => h !== handler);
        if (this.handlers.length === 0) clearInterval(this.timerInterval)
    }
}

export const timers = new Timers();