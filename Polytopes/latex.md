\chapter{Introduction}

\section{The Positioning Australia Program}
The Australian Government is making a significant investment in the Positioning Australia program through Geoscience Australia. The program contains three major projects:
\begin{itemize}
   \item The commercial procurement and operation of a Satellite Based Augmentation System (SBAS) called SouthPAN which will enhance positioning across the region through the provision of extra GNSS signals and data delivered from a geostationary satellite.
   \item The enhancement of the National Positioning Infrastructure Capability (NPIC) which will see upgrades to and an expansion of the Global Navigation Satellite System (GNSS) Continuously Operating Reference Station (CORS) network across the South Pacific and Antarctica.
   \item Ginan is an open source Precise Point Positioning (PPP) toolkit. It can produce PPP position correction products and, operating in another mode, use GNSS observations and those correction products to determine positions with an accuracy in the centimetre range.
\end{itemize}
The program is summarised in Figure \ref{fig:pa} below.
\begin{figure}[h]
\includegraphics[width=\textwidth]{Pictures/PositioningOZExplainerv01.jpg}
\caption{\label{fig:pa}The three main projects in the Positioning Australia program.}
\end{figure}

\section{Ginan - Analysis Centre Software}
Ginan, is being rolled out in a phased approach and will offer products in four distinct categories:
\begin{itemize}
   \item The software itself. Ginan is open-source software that GA has hosted on a GitHub repository.
   \item Standard precise point positioning (PPP) product files. An operational version of Ginan, maintained by Geoscience Australia (GA), will produce on a 24 X 7 basis, a range of standard PPP product files including, for example, a precise orbits and clocks file in SP3 format.
   \item Precise point positioning correction messages. An operational version of Ginan, maintained by GA, will stream over the internet on a 24 X 7 basis, a range of PPP correction messages in the RTCM3 message format.
   \item New PPP products and applications yet to be defined. The Ginan toolkit gives GA the ability to offer new PPP products, yet to be defined, but which, in collaboration with users, may spawn new applications and commercial opportunities.
\end{itemize}
Ginan is summarised in Figure \ref{fig:gpo} below.
\begin{figure}[h]
\centering
\includegraphics[height=12cm]{Pictures/GinanDeliverablesv02b.jpg}
\caption{\label{fig:gpo}The Ginan product offering.}
\end{figure}


\section{This document}
This document forms part of the Ginan documentation suite. Geoscience Australia has made Ginan open source to encourage researchers and developers to use and adapt the software for their own purposes, and to contribute new ideas and innovations back to the code base. To make this exchange as smooth as possible, Geoscience Australia recommends that developers follow this coding standard to ensure a consistent code presentation and look and feel.
