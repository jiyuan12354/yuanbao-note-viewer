import React from "react";

function NoteContent({ note, onClick }) {
  if (!note) {
    return (
      <div className="text-gray-500" onClick={onClick}>
        Select a note to view
      </div>
    );
  }

  return (
    <div
      className="yb-layout__content agent-layout__content"
      onClick={onClick}
    >
      <div className="agent-dialogue">
        <div className="agent-dialogue__content-wrapper">
          <div className="agent-dialogue__content">
            <div className="agent-dialogue__content--common">
              <div
                className="agent-dialogue__content--common__content"
                id="chat-content"
              >
                <div className="agent-chat__list">
                  <div className="agent-chat__list__content-wrapper">
                    <div
                      className="agent-chat__list__content"
                      style={{ marginRight: "0px" }}
                    >
                      <div
                        className="agent-chat__list__item agent-chat__list__item--ai agent-chat__list__item--last p-0"
                        data-conv-idx="158"
                        data-conv-speaker="ai"
                        data-conv-speech-mode="0"
                        data-conv-sensitive="false"
                        data-conv-id="b5e1d739-7f95-4221-bc59-0c8cf5dda717_158"
                      >
                        <div className="agent-chat__list__item__content">
                          <div className="agent-chat__bubble agent-chat__bubble--ai">
                            <div className="agent-chat__bubble__content">
                              <div
                                className="agent-chat__conv--ai__speech_show"
                                data-conv-index="79"
                                data-speech-index="0"
                              >
                                <div
                                  className="hyc-component-reasoner"
                                  dangerouslySetInnerHTML={{
                                    __html: note.content,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="agent-chat__list__placeholder"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteContent;