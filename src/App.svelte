<script lang=ts>
  import {timers as timerStore, type Timer} from "./Timers.svelte"

  let timers: Timer[] = $state([]);
  timerStore.addCountdownHandler((timer) => timers = timer);

  timerStore.icalUrl = "https://api.somtoday.nl/rest/v1/icalendar/stream/d1b640b7-b7da-4aee-a10f-e259a49fcdc5/d64a5930-a59b-4e63-ae93-1352daaf0994"
  alert(timerStore.icalUrl)
</script>

{JSON.stringify(timers)}