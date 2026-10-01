# Optional licensed soundtrack

The site's default music is an original loop synthesised in the browser
(`app/soundtrack.ts`) because the 2016 *Sarrainodu* album recording belongs to
Lahari Music and cannot be shipped inside this repository.

If you hold the rights to use the real recording, publish it here as:

```
public/audio/sarrainodu.mp3
```

`SoundBridge` probes that URL on load (a single `HEAD` request) and plays the file
instead of the synthesised loop as soon as it exists — same autoplay behaviour,
same bottom-left Stop control, still looped. Any browser-supported format works
(MP3, M4A/AAC, Ogg, WAV); keep it under roughly 2 MB (a 96 kbps mono cut of a
1–2 minute excerpt is plenty for a background loop) and delete the file to go back
to the synthesised anthem.
