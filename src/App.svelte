<script lang="ts">
  import ICAL from "ical.js";

  interface Lessons {
    summary: string;
    endDate: Date;
  }

  const getCalendar = async (): Promise<Lessons[]> => {
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
</script>

<main class="w-full h-screen flex justify-center items-center">
  <div
    class="p-4 lg:p-8 border-2 rounded-xl shadow-xl hover:shadow-lg hover:translate-y-1 transition-all flex justify-center items-center text-[4rem] md:text-[10rem] xl:text-[15rem] font-mono font-gray"
  >
    20:00
  </div>
</main>

{#await getCalendar()}
  <p>Loading...</p>
{:then jcalData}
  <p>{JSON.stringify(jcalData)}</p>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
