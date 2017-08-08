FROM ubuntu:latest

MAINTAINER Richard Berger <richard.berger@outlook.com>

RUN apt update && apt install -y wget build-essential cmake git python

RUN wget -qO /tmp/emsdk-portable.tar.gz https://s3.amazonaws.com/mozilla-games/emscripten/releases/emsdk-portable.tar.gz && \
    tar xvzf /tmp/emsdk-portable.tar.gz -C /usr && rm /tmp/emsdk-portable.tar.gz

RUN cd /usr/emsdk-portable && \
    ./emsdk update && \
    ./emsdk install latest && \
    ./emsdk activate latest


ENV PATH /usr/emsdk-portable/clang/e1.37.16_64bit:/usr/emsdk-portable/node/4.1.1_64bit/bin:/usr/emsdk-portable/emscripten/1.37.16:$PATH
ENV EMSDK /usr/emsdk-portable
ENV BINARYEN_ROOT /usr/emsdk-portable/clang/e1.37.16_64bit/binaryen

ENV EMSCRIPTEN /usr/emsdk-portable/emscripten/1.37.16

RUN mkdir -p /app

RUN groupadd -g 114 jenkins

RUN useradd -u 106 -g 114 -ms /bin/bash jenkins

RUN chown -R jenkins:jenkins /usr/emsdk-portable

USER jenkins

RUN /usr/emsdk-portable/emsdk activate

ENV EM_CONFIG=/home/jenkins/.emscripten

CMD /bin/bash
