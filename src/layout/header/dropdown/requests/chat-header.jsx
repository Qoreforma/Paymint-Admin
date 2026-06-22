import React from "react";
import { Link } from "react-router-dom";
import { Icon, UserAvatar } from "../../../../components/Component";
import { findUpper } from "../../../../utils/Utils";

export const ChatItemHeader = ({ item }) => {
  return (
    <Link to={`/app-chat`} className="chat-link">
      {item.group === true ? (
        <div className="chat-media user-avatar user-avatar-multiple">
          {item.user.slice(0, 2).map((user, idx) => {
            return (
              <UserAvatar
                key={idx}
                theme={user.theme}
                text={findUpper(user.name)}
                image={user.image}
                className="chat-media"
              ></UserAvatar>
            );
          })}
          <span className={"status dot dot-lg dot-success"}></span>
        </div>
      ) : (
        <UserAvatar theme={item.theme} text={findUpper(item.name)} image={item.image} className="chat-media">
          <span className={`status dot dot-lg dot-${item.active === true ? "success" : "gray"}`}></span>
        </UserAvatar>
      )}
      <div className="chat-info">
        <div className="chat-from">
          <div className="name">{item.nickname ? item.nickname : item.name}</div>
          <span className="time">{item.date}</span>
        </div>
        <div className="chat-context">
          <div className="text">
            <p>{item.convo.length !== 0 && item.convo[item.convo.length - 1].chat[0]}</p>
          </div>
          <div className="status delivered">
            <Icon
              name={`${
                item.delivered === true ? "check-circle-fill" : item.delivered === "sent" ? "check-circle" : ""
              }`}
            ></Icon>
          </div>
        </div>
      </div>
    </Link>
  );
};
