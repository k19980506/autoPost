import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  TextField,
  Stack,
} from "@mui/material";

import "./PostScheduler.css";

const SchedulePage = () => {
  function toIsoString(date) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? "+" : "-",
      pad = function (num) {
        return (num < 10 ? "0" : "") + num;
      };

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ":" +
      pad(Math.abs(tzo) % 60)
    );
  }

  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return toIsoString(now).slice(0, 16);
  });

  const incrementDate = useCallback((dateTime, days) => {
    const date = new Date(dateTime);
    date.setDate(date.getDate() + days);
    return toIsoString(date).slice(0, 16);
  }, []);

  useEffect(() => {
    setScheduleData((prevData) =>
      prevData.map((row, index) => ({
        ...row,
        publishTime: incrementDate(selectedTime, index),
      }))
    );
  }, [selectedTime, incrementDate]);

  const [scheduleData, setScheduleData] = useState(
    Array.from({ length: 1 }, (_, index) => ({
      photoPreview: "",
      photoUrl: `facebook_${index + 1}.jpg`,
      publishImmediately: false,
      publishTime: incrementDate(selectedTime, index),
      postContent: "",
    }))
  );

  const handleSwitchChange = (index) => {
    setScheduleData((prevData) => {
      const newData = [...prevData];
      newData[index].publishImmediately = !newData[index].publishImmediately;
      return newData;
    });
  };

  const handleTimeChange = (index, value) => {
    setScheduleData((prevData) => {
      const newData = [...prevData];
      newData[index].publishTime = value;
      return newData;
    });
  };

  const handleTextChange = (index, key, value) => {
    setScheduleData((prevData) => {
      const newData = [...prevData];
      newData[index][key] = value;
      return newData;
    });
  };

  const callAPI = async () => {
    try {
      const promises = scheduleData.map(async (row, index) => {
        let postData = {
          message: row.postContent,
          url:
            "https://www.masterllife.com/wp-content/uploads/facebook/" +
            row.photoUrl,
          published: row.publishImmediately,
          scheduled_publish_time: row.publishTime,
          access_token: process.env.REACT_APP_ACCESS_TOKEN,
        };

        const response = await fetch(
          `https://graph.facebook.com/${process.env.REACT_APP_ID}/photos`,
          {
            method: "POST",
            body: JSON.stringify(postData),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API call failed for row ${index + 1}`);
        }
      });

      await Promise.all(promises);
      alert("所有API调用成功！");
    } catch (err) {
      alert(`发生错误：${err.message}`);
    }
  };

  return (
    <Container style={{ padding: "10px" }}>
      <div className="hd">
        <Stack
          direction="row"
          spacing={2}
          marginBottom={2}
          style={{ flex: "auto" }}
        >
          <TextField
            label="選擇時間"
            type="datetime-local"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
        <button onClick={() => callAPI()}>一鍵發文</button>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>照片預覽</TableCell>
              <TableCell>照片名稱</TableCell>
              <TableCell>立即發文</TableCell>
              <TableCell>發文時間</TableCell>
              <TableCell>發文文章</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scheduleData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  <img
                    src={
                      "https://www.masterllife.com/wp-content/uploads/facebook/" +
                      row.photoUrl
                    }
                    alt="Preview"
                    style={{ width: "200px", height: "200px" }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.photoUrl}
                    onChange={(e) =>
                      handleTextChange(index, "photoUrl", e.target.value)
                    }
                    fullWidth
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={row.publishImmediately}
                    onChange={() => handleSwitchChange(index)}
                  />
                </TableCell>
                <TableCell>
                  {row.publishImmediately ? null : (
                    <TextField
                      type="datetime-local"
                      value={row.publishTime}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      fullWidth
                    />
                  )}
                </TableCell>
                <TableCell>
                  <textarea
                    value={row.postContent}
                    onChange={(e) =>
                      handleTextChange(index, "postContent", e.target.value)
                    }
                    style={{ height: "100px", width: "300px" }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default SchedulePage;
