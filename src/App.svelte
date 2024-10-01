<script lang="ts">
  import ICAL from "ical.js";

  type Lessons = {
    summary: string;
    endDate: Date;
  };
  type Timers = {
    name: string;
    time: `${number}:${number}:${number}`;
  };

  const getLessons = async (): Promise<Lessons[]> => {
    const response = await fetch(
      "https://elo.somtoday.nl/services/webdav/calendarfeed/d1b640b7-b7da-4aee-a10f-e259a49fcdc5/6a3e961d-f875-4033-a927-fb851092a45b",
    );
    const text = await response.text();
    const jcalData = ICAL.parse(text);

    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    const lessons: Lessons[] = vevents.map((event) => {
      const vevent = new ICAL.Event(event);
      return {
        summary: vevent.summary,
        endDate: vevent.endDate.toJSDate(),
      };
    });

    const now = new Date();
    const todayLessons = lessons.filter(
      (event) =>
        event.endDate.toDateString() === now.toDateString() &&
        event.endDate.getTime() > now.getTime(),
    );
    return todayLessons;
  };

  const calculateTimeLeft = (endDate: Date): `${number}:${number}:${number}` => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}:${minutes}:${seconds}`;
  };
  const calculateAllTimesLeft = (lessons: Lessons[], max: number = 2, all: boolean = false) => (all ? lessons : lessons.slice(0, max)).map((lesson) => ({name: lesson.summary, time: calculateTimeLeft(lesson.endDate)}));

  let lessons: Lessons[] = [];
  let timers: Timers[] = $state([]);

  $effect(() => {
    getLessons().then(v => lessons = v)
    const calendarInterval = setInterval(() => {alert("UPDATED");getLessons().then(v => lessons = v)}, 900000); // 900000

    const timersInterval = setInterval(() => {
      timers = calculateAllTimesLeft(lessons);
    }, 1000);

    return () => {
      clearInterval(calendarInterval);
      clearInterval(timersInterval);
    };
  });
  

</script>

<main class="w-full h-screen flex justify-center items-center">
  <div
    class="p-4 lg:p-8 border-2 rounded-xl shadow-xl hover:shadow-lg hover:translate-y-1 transition-all flex justify-center items-center text-[4rem]  font-mono font-gray"
  >
    {JSON.stringify(timers)}
  </div>
</main>