const session = location.pathname.substring(6),
      canvas = document.querySelector('#canvas'),
      namesContext = document.querySelector('#namesCanvas').getContext('2d'),
      context = canvas.getContext('2d'),
      api = 'http://localhost:3000',
      socket = io(`/${session}`), 
      borderStyle = '#292929',
      fillStyle = '#7a7a7a';
let   boxSize = 25,
      boxBorder = 1,
      mainGrid = [[]],
      client = null,
      players = {},
      gridUpdate = true,
      playerMoved = false;
      const backimg =
        `data:image/png;base64,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`;
    const piece = `
    data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdm
ciIHZpZXdCb3g9IjAgMCAzMjAgMzIwIiB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCI+PGRlZnM+PG
ltYWdlIHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBpZD0iaW1nMSIgaHJlZj0iZGF0YTppbWFnZS
9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFVQUFBQUZBQ0FZQUFBRE5rS1dxQU
FBSkJFbEVRVlI0bk8zZHZXOWRkeDNIOGU4NXgyNVMwNGMwVVZzclptRm85d2p3QkNNTHNQTVhJRl
dvVTd0MTZOQ2hUTzNFMEQrQ2hRRVdacGFBRkFabUt0RzZNWkZJMDVTa1NhN3ZPZWdtamhSVnRQND
V2VW1jODNtOXJDdGI4WTN2UFUvdi9JNXpIcnJkM2QxcWRMMzFpUUJQMkFzdEw5OWJTa0FxQVFSaU
NTQVFTd0NCV0FJSXhCSkFJSllBY215MzZ0WXRjNDA1RUVDT1phOHV2M0s2VHIreVgxZCsvWGxkKz
l0WGRldXJxU1l6a2FmU2lUc1FlclV4alRVKzlCWTExTkN0OXgzeGdQOTdjT2xlWFg1eHFQNW5mUT
AvSEdwNHJhLysxYUg2TTMzMXovWFZueDZxM3h4cTJCaHE2THV5ZUU2cVJSMk1kK3IyRjNkcThjK0
RPcmg0VU12ZnYxem4vcnhhYnNkNXkvZTI0V2xhZmRYZCsrZ09Qei9PS1c4NkVIb1Z3SFdIcmVtRm
ViVDJOdmRQVjlXcHd4ZTV2YlBZdHR2S3NWMGJ2dmpMeHJUeDZsVFRPSFYxMEUzVlRkMzlJZjkwTU
5WMFVGV3J6NHVwcGx0alRWZkhicnd5MVhTMXFwWmRkZWVHYVhqdG1Xbno5ZHY5bmIrZU8zanBWdy
s3Rks0TzEvNTBkbm5tSit0Y2lnSUlmS085emYxemg3OHF1N01LM1FQUFd4eCtIZzhmL2M1aSsrNz
M5emIzNzQ0WWR4YmI0K0hYcTMrSXQzWVcyLzladzV4ZWE2ODIxdm5EZ0hrNVJyVEcrMStzd3ZlMX
I3ODZmSHdubjIzdWYvLzhZbnV0ODlkL2dnQ3hCQkNJSllCQUxBRUVZZ2tnRUVzQWdhZkNWTFcvN3
ZlNXRzTmdidFROTC81Yk4zNzdhcjE4NUhNdmJsMTZZMTJ2QzN3bk42cnE3MVgxajkyYkZ4N2JPWT
BYdHk3OW9LcCtWRlZuVjhjanIvNXM5K2FGajc3dDd6dzdudjdEdXQ5SFN3Q2JEbXorWG0zZGZiUT
ZhbUtCK2RxOWVlSGpxdnI0L2dTMkRJck9Mcy84b21XR0hPZU1FYnZBd0t5Y1haNzVlZXYwSEJuQX
EvWDVINjBld0J3ZEdjQ3o5ZEpQOSt2ZnY3VDBnYmxwMmdWK3BwNzVqU1VQekUxVEFMZHE2OGVXUF
BBMHVIODFtaFpOVHp4ZHAwNDFQQTNnaWV1cXpxODFnQUJ6SklCQXJMVmVFTFgxREE4SFFRTVBXal
hoNHRhbE4xdG15dTdOQzc5YjE4eGIreFdoeFExNEdDMWhhNDFrSzd2QVFLeW1BQzVyNmNhdndPd1
lBUUt4QkJDSUpZQkFMQUVFWm1XcStxeDFlZ1FRbUpVSGI4eCtGQUVFWWdrZ0VHdnRaNEtzMjlzZn
Z2ZCt5NC84NEsxMzM3RWF3K014bCsyeUtZQkREZDJqZnl2ZjdLaVoyTG93QU52bGcrd0NBN0djQ2
dmRU1nSUVZZ2tnRUVzQWdWZ0NDTVFTUUNEV2lUOFF1aHpuQnlmU0hMYkxFeDlBWjNqQXlUT1g3ZE
l1TUJCTEFJRllBZ2pFRWtBZ2xnQUNzUVFRaUNXQVFDd0JCR0lKSURBcmU1djd6U2Q0Q0NBd0sxM1
ZkdXYwTkFYd1NkOFRCT0JSTUFJRVlya25DQkRMQ0JDSUpZQkFMQUVFWWdrZ0VFc0FnVmdDQ01RU1
FDQ1dBQUt4QkJDSUpZQkFMQUVFWWdrZ0VFc0FnVmdDQ016S1ZQVlo2L1FJSURBck80dnRzWFY2Qk
JDSUpZQkFMQUVFWWdrZ0VFc0FnVmdDQ01RU1FDQ1dBQUt4QkJDSTFSVEFvWWJPS2dMTWpSRWdFRX
NBZ1ZnQ0NNUVNRQ0NXQUFLeEJCQ0lKWUJBTEFFRVlna2dFRXNBZ1ZnQ0NNUVNRQ0NXQUFLeEJCQ0
lKWUJBTEFFRVlna2dFRXNBZ1ZnQ0NNUVNRQ0NXQUFLeEJCQ0lKWUJBTEFFRVlna2dFRXNBZ1ZnQ0
NNUVNRQ0NXQUFLeEJCQ0lKWUJBTEFFRVlna2dFRXNBZ1ZnQ0NNUVNRQ0NXQUFLeEJCQ0lKWUJBTE
FFRVlna2dFRXNBZ1ZnQ0NNUVNRQ0JXY3dEM052ZkZFcGlWNXFoMVZlY3RlbUJPak9xQVdBSUl4Qk
pBSUpZQUFyRUVFSWdsZ0VBc0FRUmlDU0FRU3dDQldBSUl4QkpBSUpZQUFyRUVFSWdsZ0VBc0FRUm
lDU0FRcXptQTV4ZmJuMXBOZ0RreEFnUmlOUVZ3V2N2SktnTE1qUkVnRUVzQWdWZ0NDTVFTUUNDV0
FBS3hCQkNJSllCQUxBRUVZZ2tnRUVzQWdWZ0NDTVFTUUNDV0FBS3hCQkNJSllCQUxBRUVZZ2tnRU
tzcGdFTU5uVlVFbUJzalFDQ1dBQUt4QkJDSUpZQkFMQUVFWWdrZ0VFc0FnVmdDQ01RU1FDQ1dBQU
t4QkJDSUpZQkFMQUVFWWdrZ0VFc0FnVmdDQ01RU1FDQ1dBQUt4QkJDSUpZQkFMQUVFWWpVRmNGbk
x5U29DekkwUklCQkxBSUZZQWdqRWFncWdYd0FDYzlRVXdMSEdwYVVQekkxZFlDQ1dBQUt4QkJDSU
pZQkFMQUVFWWdrZ0VFc0FnVmdDQ01RU1FDQ1dBQUt4QkJDSUpZQkFyS1lBRHRVUFZoRmdiaG9ET0
hTV1BEQTNkb0dCV0FJSXhCSkFJSllBQXJFRUVJZ2xnRUFzQVFSaUNTQVFTd0NCV0FJSXhCSkFJSl
lBQXJFRUVJZ2xnRUFzQVFSaUNTQVFTd0NCV0UwQlhOWnlzb29BYytPUytFQXN1OEJBTEx2QVFDd2
pRQ0JXVXdBTi80QTVhZ3JnV09QUzBnZm14aTR3RUVzQWdWZ0NDTVFTUUNDV0FBS3hCQkNJSllCQU
xBRUVZZ2tnRUVzQWdWZ0NDTVJxQ21CZi9XQVZBZWFtS1lBdUJ3M01rVjFnSUpaN2dnQ3hqQUNCV0
FJSXhISlRKQ0NXRVNBUVN3Q0JXQUlJeEJKQUlKWUFBckVFRUlnbGdFQXNBUVJpQ1NBUVN3Q0JXQU
lJeEJKQUlKWUFBckVFRUlnbGdFQ3NqWk0rNFc5LytONzdMYy83NEsxMzMzbjA3d2FvR1cyWFRRR2
M2c2xlRC9Xb21kaTZNSUQxbWNOMjJYcGZZRGRGQW1hbk5ZQ1dQREE3N2drQ3hESzBBMklKSUJCTE
FJRllBZ2pFT3ZFSFFwZmovT0JFbXNOMmVlSUQ2QXdQT0hubXNsM2FCUVppQ1NBUVN3Q0JXQUlJeE
JKQVlGYjJOdmVidXlhQXdLeDBWZWRicDBjQWdWbVpxdlpicDBjQWdWblpXV3dmdEU2UEFBS3gxbj
RteU1XdFMyOGM5WnpkbXhjK3Nzb0JEN3E0ZGVuTnh6MUR1dDNkM2V0SFBXbDFRZFNoaGhmWDlhS3
JTSW9nY044amFNS1JYYXZXWGVDaEJ2Y0VBV2JIN3dDQldBSUl4QkpBSUpZQUFyRUVFSWdsZ0VDcz
VnT2hEN3FEYTdlN085Y1B1b01yeTFwZVhuYmozbFRUdjhZYVA1bTZ1anpWOU9sVTB5YzdpKzBiVm
lmZ2FkQWN3STFwbzkrWU5zNVUxZXJ4K3JjODlZV1duOWR5eGdqQTF6UWQ0TnlxNlV5UVkyb0tJTU
JEV0d1di9BNFFpQ1dBUUN3QkJHSUpJQkJMQUlGWUFnakVFa0FnMXRvdmliKzN1Zjk4VjNXMjd0Nm
VybnVscWp0MXZKOHczWjVxdXJLNkVQWDV4ZmFuVmszZ1VkazR4b0hMVFFjZzdpeTI5OWI1WHNjYV
Y1ZmtIOGNhRjh0YTNsblcrT1ZZNC9XeHhpL3ZmWCs2Vm5lSHN0MlpWV3o3NnA3cnE5L3FxMysyci
82WnJxcnJxeCtxdW02amhvM2VvUGVockc2TDhPRGY2NnJyekV0T3NLYXVyWDBFdUc3OXZZL1Zsbm
JxOFBGOEhlUEd4NnlIMnlJd1IvNEpCMklKSUJCTEFJRllBZ2pFRWtBZ2xnQUNzUVFRaUNXQVFLYX
EraDlDdzRoUmtZZ2ljUUFBQUFCSlJVNUVya0pnZ2c9PSIvPjxpbWFnZSB3aWR0aD0iMzAyIiBoZW
lnaHQ9IjMwOCIgaWQ9ImltZzIiIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0
dnb0FBQUFOU1VoRVVnQUFBUzRBQUFFMENBWUFBQUNTRGQ2K0FBQU1XVWxFUVZSNG5PM2R6VzljMT
NuQTRmZGN6cEN5YVVtVVliUnlIRGtGV2x0bWlINnN1a3BYQmJKb045MTUzMVdCYkxwcWdIUmJCRW
hXWFRUTFp0OWR1K29ma093S2RNZlFodEUyc0IzWjhTZEZtZFlIWjg0cDdwMFpoMVppYVNpTlJMNz
A4d0RTRE1uaGVPYmVPei9mT3pyM1RIbjk5ZGNENEt2c0h1NTE4eDh0THV0OTF3YzdtOXYxYVMzRW
tiVUY1OThENGxPUGZYL3h2ZU8zWGJ2djYrUDYyMDhpb3ZYWGR3LzMrcS9yMHdpWWNNRTVOZzlXZH
l4Q2k5Zjg0bkl5dit6bTEvdnZyL2ZmS0ZFMkltSTh2Nzc0M2JvSVhJdDJGQkZIRVdYU290NmUvLz
VSSDdDZHplM0prMXlxd2dYbjFPN2gzbWorR3UvanMxNmlHMGUwelppSHFNMSsxdDEzNk5lVjRmdG
xYQ0tlalZJdWxGbndObWIzVldwRVc4VHJxTFYycDBVY1JuU0hFZTFXUkRuc0k3Wjd1SGQwTElvcj
N3c1RMbjdMbXpmZitwdnJsMS81ZDBzbXIzbTArbUE5VzZMMGY1NHZVUzVHNlM3M1gvYy9LeEhyTF
dMUzcxbTFhSGRudHh2aTlGeFhocjJ0alJKRHVDNUVsRkVmc0RZTDFyU1BWNHU0MDBxN1hWdTcyYU
o5MnFKKzJGcmJiOUhkaklqYkxWci81L09JdUxNSTJhb0NKbHg4U1d2dDRQcmxWK0xtdllQYk4rL2
QvTm50NloxL203VEpmK3hzYmQrenBISlk3R21WNkM1R3hOV3VkTmZXb3Z2Vy9QTDNTK21lbXg4Rz
ludGVzOXVXS0JGbHJVUlo3NkxiS0NYR3cyV1U0UkN6bERJODk5YjZZTFZwSDdBV2RWSmJ1MU9qSH
RaV1A2dHQrbkV0N1pNVzdiUGFhbjk1czBaN3Y3YjZYa1I4MEtMZTNEM2N1N3VLZUQzMWNPM3U3MT
NzNi8rSXZ6Nzk5dFpyNzY3NElmRWJCNHNOOVBMNnBXY3VyMS82YmtSOGQ5cW0vM3B3ZE92Mm5lbW
RUNDdxMFh1VE9ubC8ycWEvbnJiNnF4YnQxLzJHV1Z1OTBhSzlzN08xZmN2eVBEMkw5N1JLZEZzbD
RodHJaZTFQUm1YMFordmQraDl2bFBWckc5MzY1WEczUGg3RjJ0cGF0MVkrbjM1K2QvWmdTK21pbE
ZLNnZtRmQzN0V5ZkQzN2FXdkQzLzI3OEszMStlcXZ0MXByLzNlcjAybE1KN1hWdTlNMnZWdWozcT
J0SFU3YjlOYWtUZDZleFBUTmFadjhkNDN5Vm92MmNiODM5cmdMNkZHR1F4eWNrWFgwdGRadk9MWE
4vc2ZWOVp0Y2xLLzdJdUVSRENtNno0TzJwZU8zbjJWc2R0bG5yQS9kMnZBZS9xTjU1ODZ2Zm5idH
drdC92Y3d2TzFSTXF0KzRIbWNqZ1hoSXBINlg0N2VmSFYwZSsvSXhYYnZ3MGw4c2V3LzNqOHNBT0
JWSDdlaTNkLytFQ3pndmhBdElSN2lBZElRTFNFZTRnSFNFQ3pnVFJzTlpSY3RaZWh6WFd3Zi84M2
N2YkR6L2oxYzJyanowdHJ1SGU0ODZNaDU0Zk4zc1hNUnVzMFQwNXloK296L2RwNHV1UC8zbmhSTG
xjaW5EK1l2clpYYWF6NFV5bkV4ZE5yclNQZHNOSjFnUDMrK0dJZldsZEl0VGZXclVlOU5XYjAzYj
lJTkptL3pmdEUzZnJsRi9XVnY3c0QvRko2SWRSSlI3ODlraTV1YzF4bUs2bTA4ZTlNemV2WFBqNT
ljdXZMVFVreDh0T3hMK2xVdC9lS0tsK2FTbnRRQytXaisxVEl2YW4xTjR1MFE1YUsyOU80MTZwYl
RvbzNVcDJoQ3RaeUphTjUreVpoeFJOb2FaSVBxeHpmTnpHWTlOaWRQSDUxNXJiZElIcWtXN1ZXZW
5mTzNQZ2xWdS9XWnFtemJkMmZ6eXVhM3o4eWNmNk5xRmw3NnpUSS82RWZaR3pzUDVOSVFtaHBPaG
g3MmwyeVc2Z3hidG1XaDlzSWJwYTlhT3piZFYydnlNeFA1c3N2bWVVcGw5R2JYTTV1aWF6Sy9mbT
gzRk5jU3F2OTJkUGxiSDV1cDZvaE1KOWlQc1IrOGN2dnZ6YTV2Zi9JNk5GODZQeFF3TXU0ZDdreS
9tenBydEVkMkthS1BaUklERERCS2xQK3QxY1hrc09wUGpJV3F6dmE0aFp2UGg3VWY5M3RxeDJ3Nm
UxdlRObzJ1YjMveXJXMGVmZlhCeC9Od0YyeTJjTC9PUUxDSzJPT3liendqUngydjRVWDlZZVR4Q1
g1cFAvbW5PSmIrczRWQngvOTcrZjEwY1A3ZjBDWTVBUHNjajloQm5MbFQzRzhwNk9QbjhYODdVb3
dKNGdDRmNyMTErOVQ4dEpDQ0RmaFlKQTFDQmRJUUxTT2RFNDdpV0hSSGZ2UjJ2dnRtOStRdWJBOU
RyYXZ6Qjdzdkw5ZU5oSSt6alVhWnVYbVpFZkIrdFd1dmZkbDMzenllOWYrQjhxYlgrdU91NmY5cm
V2UDdRNTdYTUNQdFlIQ3J1N2k5MzQ1TVFMU0JtTGZpSFZTK0lJVndseWxWTEdNakNtL05BT3NJRn
BDTmNRRHJDQmFReUx1TWlYRUE2d2dXa2M2NW1RRzJ0SFo2Qmh3Rm5XaWxsTS9zYU92Vnd0ZFpQQW
Z0d3BaVHhrcmQ3OGNrK1lzaXJ0ZmJlTWc5KzFhL0xWUnZDMWFMZE9NMDE4WU9mL09pQlQvNkgzL3
YrVWdzUldKMnovTHJzN3JzRU9QT2M4Z09rWTA4TFNFZTRnSFNFQzBoSHVJQjBoQXRJNTB5TW5EZE
9DODZlcy95NlBQVnduZGJJVytDcm5mWFhwVU5GSUIzaEF0SVJMaUFkNFFMU0VTNGdIZUVDMGhFdU
lCM2hBdEk1MVFHbzVvaUhwMi9Wcjd1blBZZDlpM1ltUnM2Ykl4NmVrbFcvM3BhZHczNlZKbTNTaG
tQRjA1NXpIdUFrekRrUHBHUE9lU0FkZTFwQU9zSUZwQ05jUURyQ0JhUWpYRUE2d2dXa0kxeEFPc0
lGcENOY1FEckNCYVFqWEVBNndnV2tJMXhBT3NJRnBESXU0eUpjUURyQ0JhUWpYRUE2d2dXa0kxeE
FPc0lGcENOY1FEckNCYVFqWEVBNndnV2tzL2dJL3ZldE9pQ0xJVnc3VzlzVGF3ekl3cUVpa0k1d0
Fla0lGNUNPY0FIcENCZVFqbkFCNlFnWGtJNXdBZWtJRjVDT2NBSHBDQmVRam5BQjZRZ1hrSTV3QW
VrSUY1Q09jQUhwQ0JlUWpuQUI2UWdYa0k1d0Fla0lGNUNPY0FIcENCZVFqbkFCNlFnWGtJNXdBZW
tJRjVDT2NBSHBDQmVRam5BQjZRZ1hrSTV3QWVrSUY1Q09jQUhwQ0JlUWpuQUI2UWdYa0k1d0Fla0
lGNUNPY0FIcENCZVFqbkFCNlFnWGtJNXdBZWw4RWE2amR0U3NQaUFEZTF4QU9zSUZwQ05jUURyQ0
JhUWpYRUE2d2dXa0kxeEFPc0lGcENOY1FEckNCYVFqWEVBNndnV2tJMXhBT3NJRnBDTmNRRHJDQm
FUelJiakdaVnlzUGlDRElWeTcrM3NqYXd2SVlnaFhpWExWR2dPeThCNFhrSTV3QWVrSUY1Q09jQU
hwQ0JlUWpuQUI2UWdYa0k1d0Fla0lGNUNPY0FIcENCZVFqbkFCNlFnWGtJNXdBZWtJRjVDT2NBSH
BDQmVRemhDdUZ1MkdWUWRrTVlScloydTdXbU5BRmc0VmdYU0VDMGhIdUlCMGhBdElSN2lBZElRTF
NFZTRnSFNFQzBoSHVJQjBoQXRJUjdpQWRJUUxTRWU0Z0hTRUMwaEh1SUIwaEF0SVI3aUFkSVFMU0
VlNGdIU0djTzN1NzQyc09pQ0xJVndseWxWckRNakNvU0tRam5BQjZRZ1hrTTRpWEdPckRzaGlDRm
RYdWhlc01TQUxoNHBBT3NJRnBDTmNRRHJDQmFRalhFQTZ3Z1drSTF4QU9zSUZwQ05jUURyQ0JhUW
pYRUE2d2dXa000U3J0dnFlVlFka01ZVHIyMXV2dld1TkFWazRWQVRTRVM0Z0hlRUMwaEV1SUIzaE
F0SVJMaUFkNFFMU0VTNGdIZUVDMGhFdUlCM2hBdElSTGlBZDRRTFNFUzRnSGVFQzBoRXVJSjBoWE
x2N2V5T3JEc2hpQ0ZlSmN0VWFBN0lZd3RXaTNiREdnQ3dXNzNGNXJ3dEl3NkVpa0k0OUxTQ2RSYm
pHVmgyUXhSQ3VyblF2V0dOQUZnNFZnWFNFQzBoSHVJQjBoQXRJUjdpQWRJUUxTRWU0Z0hTRUMwaE
h1SUIwaEF0SVI3aUFkSVp3MVZZL3N1cUFMQlo3WEVmV0dKQ0ZRMFVnSFhQT0Era000ZHJaMnE1V0
haQ0Z6MVVFMHZGaEdVQTYzcHdIMGhFdUlCM2hBdElSTGlBZDRRTFNPZlZoRUsyMTkxWjVmNldVRj
FkNWYzQ2VyUHIxZGxwT05WeWxsTTFWM2w5cjdYQ1Y5d2ZuMGFwZmQ2ZkJvU0tRam5BQjZRZ1hrST
V3QWVrSUY1Q09jQUhwQ0JlUWpuQUI2WnlGa2ZOTGZWQkhLV1g4NUI4TkVBbGVsNHR3Ylp6R2Yzem
hCei81MFFPZi9BKy85MzJmUWdSUDJWbCtYUzQrTE9QZ3RCNEF3RWt0M3VQNjFKSURzakRuUEpDT2
YxVUUwaEV1SUIzaEF0SVJMaUNkTS9FSjFzWnB3ZGx6bGwrWHB4NnVWWSs4UFM5emFzTnBPdXRucX
B5SlBhNVZPUTl6YVFNUDV6MHVJQjNoQXRJUkxpQWQ0UUxTRVM0Z2xhTjIxSVFMU0dWVVJrVzRnRl
JLbENkM3FGaHIvWHViQTFCci9mR3FGOEtKQjZEdUh1NDk5SGU2R3E5MlhmZlRpUGpwSXo4eTRGem
91cTZQMXgvdEh1NzljbFhQNTBUaDJ0bmMvbVNaMisyK3ZQZjg5dWIxUjM1UXdQblNSMnZaZml4ak
1lZjhEZHNKa01VUXJwMnQ3V3FOQVZuNFYwVWdIZUVDMGhFdUlCM2hBdElSTGlDZEw4Wng3UjIrK2
Vlak12ckxVUm45NmFpTVhoNTFvOThibDlHbGNSbHZycFcxOGJpTVIrTXk2anBuQ1FHbjdJdHdiVz
llZnlNaTNsamk0UndzODVDWEdXRVBjSjlMeXl5UUp4S1hWWTZRQmJpZjR6NGdIZUVDMGhFdUlCM2
hBdElSTGlBZDRRTFNFUzRnblJPUDQ2cXR4alNtcmI4K2FkTnBhN1dkNVBkTDZjcW9ySzMxMThkbF
hHd3l3RW1kT0Z4ZDZTNTE4eDIxY1JrLzlnTGYzZCs3VXFKYzYwcjNZbGU2bDlkSzk2MjFzbmExSz
kyVmFQMTAxV3ZEU05wYXB3Y3QydWUxMVU5cjFJOXFheC9VVmorT2lMc3Qya2N0MmxGdDlYOTN0cl
kvdEJXYzNDLzIzN2gyZkErOFJkdmYyZHErbWVncDhIVVJFZjhQMmo1TTBFK0hpMkFBQUFBQVNVVk
9SSzVDWUlJPSIvPjxpbWFnZSB3aWR0aD0iMTIyIiBoZWlnaHQ9IjEyMiIgaWQ9ImltZzMiIGhyZW
Y9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSG9BQUFCNk
NBWUFBQUJ3V1Vma0FBQUIxVWxFUVZSNG5PM2J3VTBDVVFCRjBkSFFnVlhvV2x2WEltQ3Q5a0Rzd2
FoYkpKODR5QXozbkFJSXpzVlA4dks1ZVhsL2ZwMVluTWU3cDRjNTM5Tm0rbm5SZTZtWFkvZXhmWn
Y3emR5dStIbHdBcUVqaEk0UU9rTG9DS0VqaEk0UU9tSlRmd0JMdGZ2WURpMldvd3ZhZCtoekxERW
pMSEtIalQ2WFU3cHQ1dDVVUjQxK1lwbUg3K2dJb1NPRWpoQTZRdWdJb1NPRWpyQ01yZHpvSG5Hej
MrOHY4cGVlWXpDeHRCMzJ0YUJkN0Q5NjdrWE8wbmFjNytnSW9TT0VqaEE2UXVnSW9TT0VqaEE2NH
FvbTBMbnZ2bDNUMG5ZMW9TMXR4em02STRTT0VEcEM2QWloSTRTT0VEcEM2QWlYQTQ4WVhkcldzS0
FKL1l2UnBXMHRDNXFqTzBMb0NLRWpoSTRRT2tMb0NLRWpoSTR3bU14Z0RRdWEwSCswbGdYTjBSMG
hkSVRRRVVKSENCMGhkSVRRRVVKSENCMGhkSVRRRVVKSENCMGhkSVRRRVVKSENCMGhkSVNyUlAvb2
tuZkxoUDRubDc1YjV1aU9FRHBDNkFpaEk0U09FRHBDNkFpaEk0U09FRHBDNkFpaEk0U09FRHBDNk
FpaEk0U09FRHJDVmFJRk9zZmRNcUVYNWx4M3l4emRFVUpIQ0IwaGRJVFFFVUpIQ0IwaGRJVFFFVU
pIQ0IwaGRJVFFFVUpIQ0IwaGRJVFFFVUpIQ0IwaGRJVFFFVUpIQ0IwaGRJVFFFVUpIQ0IwaGRJUW
YyYTNZNks4dXAybWFQZ0dJWEZXbUVHQ0RlQUFBQUFCSlJVNUVya0pnZ2c9PSIvPjxpbWFnZSB3aW
R0aD0iMTIzIiBoZWlnaHQ9IjEyMiIgaWQ9ImltZzQiIGhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2
U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSHNBQUFCNkNBWUFBQUNmbXl6YUFBQUJoMGxFUV
ZSNG5PM2J3VzJEUUJCQVVSSzVqYlRFalVacEtZMmtoYkZqRzh4Lzc4NEJmYzFLakphdmJkdCtsen
V0Ni9wejd6TWM3MXVERHJGRHhBNFJPMFRzRUxGRHhBNFJPMFRzRUxGRHhBNFJPMFRzRUxGRHhBNF
JPMFRzRUxGRHhBNFJPMFRzRUxGRHhBNFJPMFRzRUxGRHhBNFJPMFRza05zanI3cnYrK2pQVDM5N2
5vdkpEaEU3Uk93UXNVUEVEaEU3Uk93UXNVUEVEaEU3Uk93UXNVUEVEaEU3Uk93UXNVUEVEaEU3Uk
95UWgrNmdUYm1yZGk0bU8wVHNFTEZEeEE0Uk8wVHNFTEZEeEE0Uk8wVHNFTEZEeEE0Uk8wVHNFTE
ZEeEE0Uk8wVHNFTEZEWG5vSGJjcGR0ZmN3MlNGaWg0Z2RJbmFJMkNGaWg0Z2RJbmFJMkNHbjJLQk
4yYlQ5ajhrT0VUdEU3QkN4UThRT0VUdEU3QkN4UThRTythZ04ydFIwMHpaMWxZMmN5UTRSTzBUc0
VMRkR4QTRSTzBUc0VMRkR4QTY1NUFidDJhNnlrVFBaSVdLSDNLWkh5ck9QTXQ3UFpJZUlIU0oyaU
5naFlvZUlIV0tEZG9DalBtTk5kb2pZSWVOajNLYnQ4NW5zRUxGRHhBNFJPMFRzRUxGRHhBNFJ1Mk
pabGovWVR5Ym9RUU1iQndBQUFBQkpSVTVFcmtKZ2dnPT0iLz48L2RlZnM+PHN0eWxlPnRzcGFuIH
sgd2hpdGUtc3BhY2U6cHJlIH08L3N0eWxlPjx1c2UgIGhyZWY9IiNpbWcxIiB0cmFuc2Zvcm09Im
1hdHJpeCgxLDAsMCwxLDAsMCkiLz48dXNlICBocmVmPSIjaW1nMiIgdHJhbnNmb3JtPSJtYXRyaX
goMSwwLDAsMSw4LDMpIi8+PHVzZSAgaHJlZj0iI2ltZzMiIHRyYW5zZm9ybT0ibWF0cml4KDEsMC
wwLDEsMTM5LDU5KSIvPjx1c2Ugc3R5bGU9Im9wYWNpdHk6IDAuNzY5IiBocmVmPSIjaW1nNCIgdH
JhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSw2MCwxMzgpIi8+PC9zdmc+`;
    const block = new Image();
    block.src = piece;
    const back = new Image();
    back.src = backimg;

const createSquare = (x, y, color = fillStyle, img) => {
    const offset = .2 * boxSize;

    context.fillStyle = color;
    context.fillRect(
         (x * boxSize) + offset/2,
         (y * boxSize) + offset/2,
         boxSize - offset,
         boxSize - offset
    );
    
    context.shadowColor = color;
    context.shadowBlur = .1 * boxSize;

    context.drawImage(
      img,
      x * boxSize + offset/2,
      y * boxSize + offset/2,
      boxSize - offset,
      boxSize - offset
    );
    
}

const resetSquare = (x,y) => {
    context.drawImage(
      back,
      x * boxSize,
      y * boxSize,
      boxSize,
      boxSize
    );
}  

const deleteShape = ({ shape, offset, name },a) => {
    shape.forEach((row,y) => {
        row.forEach((col,x) => {
            if(col){
                if(a) {
                    console.log(offset.x + x, offset.y + y);
                }
                resetSquare(offset.x+x, offset.y+y);
            }
        });
    });
    clearPlayerName({ shape, offset, name });
}

const rotateShape = (shape) => {
    shape.forEach((row,i) => {
        row.some((col,j) => {
            [
                shape[i][j],
                shape[j][i]
            ]
              =
            [
                shape[j][i],
                shape[i][j]
            ];
            return j === i;
        });
    });

    shape.forEach(row => row.reverse());
    return shape;
}

const checkCollisionForPlayer = ({ offset, name, possibleCollisions }) => {
    const currentPlayer = name;

    const xs = [Math.max(offset.x - 3,0), Math.min(offset.x + 3,mainGrid[0].length)];
    const ys = [Math.max(offset.y - 3,0), Math.min(offset.y + 3,mainGrid.length)];


    return Object.values(players).some(({ offset: { x, y }, shape, name, disconnected }) => {
        if( !disconnected &&
            currentPlayer !== name &&
            x >= xs[0] &&
            x <= xs[1] &&
            y >= ys[0] &&
            y <= ys[1]
        ){
            return shape.some((row,i) => {
                return row.some((col,j) => {
                    if(col){
                        const pos = `${i+y+1}-${j+x+1}`;
                        if(possibleCollisions.has(pos)){
                            return true;
                        } else {
                            possibleCollisions.add(pos);
                            return false;   
                        }
                    }
                });
            });
        }
    });
}

const checkPlayerEnd = ({ offset, shape }) => {
    return shape.some((row,y) => {
        return row.some((col,x) => {
            if(col){
                return !mainGrid[y+offset.y+1] || mainGrid[y+offset.y+1][x+offset.x];
            }
            return false;
        });
    });
}

const notify = (mss) => {
    const notify = document.querySelector('#notify');
    const p = document.createElement('p');
    p.innerHTML = mss;
    notify.appendChild(p);
}

const collision = (player) => {
    const { offset, id, shape } = player;
    const possibleCollisions = new Set();

    const isInvalidMove = shape.some((row,y) => {
        return row.some((col,x) => {
            if(col){
                const position = mainGrid[y+offset.y] ? mainGrid[y+offset.y][x+offset.x] : true; 
                if(position){ 
                    return true;
                }
                if(isNaN(position)){
                    return true;
                }
                possibleCollisions.add(`${offset.y+y+1}-${offset.x+x+1}`);
            }
            return false;
        });
    });
    
    return isInvalidMove || checkCollisionForPlayer({ ...player, possibleCollisions });
}

const rotatePlayer = (player) => {
    const oldOffset = { x: player.offset.x, y: player.offset.y };
    if(player.offset.x < 0){
        player.offset.x = 0;
    }
    if((player.offset.x + player.shape[0].length) > mainGrid[0].length){
        player.offset.x = player.offset.x - (player.shape[0].length-2);
    }

    const oldShape = player.shape.map(s => s.slice());

    rotateShape(player.shape);

    if(collision(player)){
        player.offset = oldOffset;
        player.shape = oldShape;
    } else {
        socket.emit('player_move',player);
    }

    player.update = true;
}

let ping = true;
const movePlayer = (name,direction) => {
    let player = players[name];
    if(!player) return;
    deleteShape(player);

    let { offset: { x, y }, shape } = player;
    switch(direction) {
        case 'DOWN':
            if(checkPlayerEnd(player)){
                drawPlayerEnd(player);
                if(ping) {
                    ping = false;
                    return socket.emit("player_end", player);
                }
                //return;
            }
            player.offset.y = y+1;
            break;
        case 'LEFT':
            player.offset.x = x-1;
            break;
        case 'RIGHT':
            player.offset.x = x+1;
            break;
        case 'ROTATE':
            return rotatePlayer(player);
    }

    if(collision(player)){
        player.offset = { x, y };
    } else {
        socket.emit('player_move',player);
    }
    player.update = true;
}

const renderPlayerName = ({ offset, shape , name, color }) => {
    namesContext.font = `${boxSize} Major Mono Display`;
    namesContext.fillStyle = color;
    namesContext.textAlign = "center";
    namesContext.fillText(name.toUpperCase(),
     ( offset.x+( shape[0].length/2 ) )*boxSize,
     ( offset.y*boxSize ) - boxSize/4);

}

const clearPlayerName = ({ offset, shape , name }) => {
    const boxes = name.length / 2;
    namesContext.clearRect(
        (offset.x+(shape[0].length/2) - boxes) * boxSize,
        ((offset.y-1)*boxSize),
        boxes * 2 * boxSize,
        boxSize
    );
}

const drawPlayers = () => {
    Object.values(players).forEach(({ shape, offset, color, update, name, disconnected },i,arr) => {
        if(!disconnected && (gridUpdate || update)) {
            renderPlayerName({ offset, name, shape, color });
            shape.forEach((row,y) => {
                row.forEach((col,x) => {
                    if(col) {
                        createSquare(offset.x + x,offset.y + y , color, block, name);
                    }
                });
            });
            arr[i].update = false;
        }
    });
}

const drawPlayerEnd = (player) => {
    player.shape.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col) {
          createSquare(player.offset.x + x, player.offset.y + y, player.color, block);
        }
      });
    });
}

const drawMainGrid = (first = false) => {
    if(gridUpdate){
        mainGrid.forEach((row,y) => {
            row.forEach((col,x) => {
                if(players[col]) {
                    if(first) {
                        createSquare(x, y, players[col].color, block);
                    }
                } else {
                    resetSquare(
                      x,
                      y,
                      fillStyle,
                      back
                    );
                }
            });
        });
    }
}

const mergePlayer = ({ shape, offset, name }) => {
    shape.forEach((row,y) => {
        row.forEach((col,x) => {
            if(col){
                mainGrid[offset.y+y][offset.x+x] = name;
            }
        });
    });
    clearPlayerName({ shape, offset, name });
    gridUpdate = true;
}

const update = (time = 0) => {
    drawMainGrid();
    drawPlayers();
    gridUpdate = false;
    requestAnimationFrame(update);
}

let interval = null;
const decrementPlayer = () => {
    interval = setInterval(() => {
        if(playerMoved){
            playerMoved = false;
        }else{
            movePlayer(client,'DOWN');
        }
    }, 1000);
}

const start = () => {
    const board = document.querySelector('.main__board-container');
    const colums = mainGrid[0].length,
      rows = mainGrid.length,
      width = +board.clientWidth,
      height = +board.clientHeight - 0.2 * +board.clientHeight;

    if(boxSize*rows > height || boxSize*colums > width){
        boxSize = Math.min(height / rows,width / colums);
    }

    boxBorder = boxSize / 20;
    const canWidth = mainGrid[0].length * boxSize;
    const canHeight = mainGrid.length * boxSize;

    namesContext.canvas.width = canWidth;
    namesContext.canvas.height = canHeight;
    context.canvas.width = canWidth;
    context.canvas.height = canHeight;

    drawMainGrid(true);
    update();
};

const renderScores = (scores) => {
    const scoreNode = document.querySelector('#scores');
    scoreNode.innerHTML = scores
        .sort((a,b) => b.score - a.score)
        .reduce((acc,{ name, score, color }) => {
            return acc += `
                <div style="color:${color}">${name} ${score}</div>
            `;
        },'<p>Scores</p>');
}

const onKey = ({ keyCode }) => {
    if(client && moves.hasOwnProperty(keyCode)){
        movePlayer(client,moves[keyCode]);
        playerMoved = moves[keyCode] !== 'ROTATE';
    }
};

document.querySelector('#play').addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.querySelector('.form__input-name').value.replace(' ','-');
    if(!name) return;

    socket.emit('new_player', {
        session,
        name,
    },(player,scores) => {
        if(player){
            client = player.name;
            players[client] = player;
            document.onkeydown = onKey;
            document.querySelector('.modal').style.display = 'none';
            localStorage.setItem(session,socket.id);
            renderScores(scores);
            notify(`<p style='color: ${player.color}'>${player.name}</p> has connected.`);
            renderDetails(player);
        } else {
            document.querySelector('#play').value = 'Name taken.';
        }
    });
});

socket.on('game_over',() => {
    notify(`Game Over.`);
    document.querySelector('.modal--over').style.display = 'block';
    document.querySelector('#restart').addEventListener('click',(e) => {
        e.preventDefault();
        socket.emit('restart');
    });
    document.querySelector('#end').addEventListener('click',(e) => {
        e.preventDefault(); 
        axios.post(`/end/${session}`).then(res => {
            window.location.href = "/";
        });
    });
});

socket.on('game_data',(game) => {
    clearInterval(interval);
    localStorage.setItem(session,socket.id);
    gridUpdate = true;
    renderScores(game.scores);
    mainGrid = game.grid;
    players = game.players;
    document.querySelector('.modal--over').style.display = 'none';
    decrementPlayer();
    notify(`Game start ${mainGrid.length} X ${mainGrid[0].length}.`)
    start();
});

socket.on('players_scores',(scores) => {
    renderScores(scores);
});

socket.on('player_move', (player) => {
    deleteShape(players[player.name]);

    players[player.name] = {
        ...players[player.name],
        ...player,
    };
});

socket.on('sweep_grid',(positions) => {
    positions.forEach(pos => {
        mainGrid.splice(pos,1);
        mainGrid.unshift(new Array(mainGrid[0].length).fill(0));
    });
    gridUpdate = true;
})

socket.on('get_player', (player) => {
    notify(`${player.name} has connected.`);
    players[player.name] = player;
});

socket.on('player_reset',({ name, player }) => {
    mergePlayer(players[name]);
    players[name] = player;
    ping = true;
});

socket.on('player_disconnect',(player) => {
    notify(`<p style='color: ${player.color}'>${player.name}</p> has disconnected.`);
    deleteShape(player,true);
    players[player.name].update = false;
    players[player.name].disconnected = true;
});

document.querySelector("#sess").addEventListener('click', () => {
    document.execCommand("copy");
});

document.querySelector("#sess").addEventListener("copy", function(event) {
  event.preventDefault();
  if (event.clipboardData) {
    event.clipboardData.setData("text/plain", window.location.href);
  }
});

const renderDetails = (player) => {
    const name = document.querySelector("#name");
    const color = document.querySelector("#color");
    const sess = document.querySelector('#sess-text');

    sess.innerHTML = session;
    name.appendChild(document.createTextNode(client));
    color.style.backgroundColor = player.color;
}

(() => {
    const id = localStorage.getItem(`${session}`);
    if(id){
        document.querySelector('.modal').style.display = 'none';
        socket.emit('reconnect_player',{ id, session },(player) => {
            document.onkeydown = onKey;
            players[player.name] = player;
            client = player.name;
            renderDetails(player);
        });
    }
})();

const moves = {
    37: 'LEFT',
    38: 'ROTATE',
    39: 'RIGHT',
    40: 'DOWN',
};