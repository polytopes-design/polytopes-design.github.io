 
# Introduction

## The Positioning Australia Program

The Australian Government is making a significant investment in the Positioning Australia program through Geoscience Australia. The program contains three major projects:
 

* The commercial procurement and operation of a Satellite Based Augmentation System (SBAS) called SouthPAN which will enhance positioning across the region through the provision of extra GNSS signals and data delivered from a geostationary satellite.
* The enhancement of the National Positioning Infrastructure Capability (NPIC) which will see upgrades to and an expansion of the Global Navigation Satellite System (GNSS) Continuously Operating Reference Station (CORS) network across the South Pacific and Antarctica.
* Ginan is an open source Precise Point Positioning (PPP) toolkit. It can produce PPP position correction products and, operating in another mode, use GNSS observations and those correction products to determine positions with an accuracy in the centimetre range.
 

The program is summarised in figure 1 below.
\includegraphics[width=\textwidth]{Pictures/PositioningOZExplainerv01.jpg}
\caption{The three main projects in the Positioning Australia program.}

## Ginan - Analysis Centre Software

Ginan, is being rolled out in a phased approach and will offer products in four distinct categories:
 

* The software itself. Ginan is open-source software that GA has hosted on a GitHub repository.
* Standard precise point positioning (PPP) product files. An operational version of Ginan, maintained by Geoscience Australia (GA), will produce on a 24 X 7 basis, a range of standard PPP product files including, for example, a precise orbits and clocks file in SP3 format.
* Precise point positioning correction messages. An operational version of Ginan, maintained by GA, will stream over the internet on a 24 X 7 basis, a range of PPP correction messages in the RTCM3 message format.
* New PPP products and applications yet to be defined. The Ginan toolkit gives GA the ability to offer new PPP products, yet to be defined, but which, in collaboration with users, may spawn new applications and commercial opportunities.
 

Ginan is summarised in figure 2 below.
\begin{figure}[h]
\centering
\includegraphics[height=12cm]{Pictures/GinanDeliverablesv02b.jpg}
\caption{The Ginan product offering.}
\end{figure}


## This document

This document forms part of the Ginan documentation suite. Ginan is a software toolkit aimed at meeting the rigorous processing requirements to support high precision geodetic positioning, as well as supporting a larger range of general GNSS positioning applications. This documentation intends to give insight into theoretical aspects of GNSS data processing. It assumes that the reader has a good understanding of the concepts and principles behind GNSS positioning.\par
If you are new to the science of GNSS positioning there are many great resources available for free on the internet. One great place to start is the [Ginan support website](https://geoscienceaustralia.github.io/ginan)

