import React, { useState, useCallback } from "react";
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
  Button,
} from "@mui/material";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LoadingButton from "@mui/lab/LoadingButton";

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

  const [day, setDay] = useState(1);
  const [startIndex, setStartIndex] = useState(1);
  const incrementDate = useCallback((dateTime, days) => {
    const date = new Date(dateTime);
    date.setDate(date.getDate() + days);
    return toIsoString(date).slice(0, 16);
  }, []);

  const [scheduleData, setScheduleData] = useState([
    {
      photoUrl: `facebook_${1}.jpg`,
      publishImmediately: true,
      publishTime: incrementDate(selectedTime, 1),
      postContent: "",
    },
  ]);

  const [loading, setLoading] = useState(false);

  const handleDayChange = (event) => {
    setDay(event.target.value);
    setScheduleData(
      Array.from(
        { length: event.target.value },
        (v, i) =>
          scheduleData[i] || {
            photoUrl: `facebook_${i + 1}.jpg`,
            publishImmediately: i === 0,
            publishTime: incrementDate(selectedTime, i),
            postContent: "",
          }
      )
    );
  };

  const handleSelectedTimeChange = (event) => {
    const time = event.target.value;
    setSelectedTime(time);

    setScheduleData((prevData) =>
      prevData.map((row, index) => ({
        ...row,
        publishTime: incrementDate(selectedTime, index),
      }))
    );
  };

  const handleStartIndexChange = (event) => {
    setStartIndex(event.target.value);

    setScheduleData(
      Array.from({ length: day }, (v, i) => {
        return {
          ...scheduleData[i],
          photoUrl: `facebook_${parseInt(event.target.value) + i}.jpg`,
        };
      })
    );
  };

  const handleSwitchChange = (index) => {
    setScheduleData((prevData) => {
      const newData = [...prevData];
      newData[index].publishImmediately = !newData[index].publishImmediately;
      return newData;
    });
  };

  const handleTimeChange = (index, value) => {
    const selectedDate = new Date(value); // 将字符串转换为日期对象
    const currentDate = new Date(); // 获取当前时间

    // 计算时间差，单位为毫秒
    const timeDifference = selectedDate.getTime() - currentDate.getTime();

    // 将时间差转换为天数
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    // 判断是否超过30天
    if (daysDifference > 29) {
      alert("時間不能超過30天");
      // 在这里可以进行相应的处理，比如提示用户选择的日期超过30天
    } else {
      setScheduleData((prevData) => {
        const newData = [...prevData];
        newData[index].publishTime = value;
        return newData;
      });
    }
  };

  const handleTextChange = (index, key, value) => {
    setScheduleData((prevData) => {
      const newData = [...prevData];
      newData[index][key] = value;
      return newData;
    });
  };

  const callAPI = async () => {
    const results = []; // 存储成功和失败的结果
    setLoading(true);
    let failed = 0;
    let success = 0;

    const promises = scheduleData.map(async (row) => {
      let postData = {
        message: row.postContent,
        url:
          "https://www.masterllife.com/wp-content/uploads/facebook/" +
          row.photoUrl,
        published: row.publishImmediately,
        scheduled_publish_time: row.publishImmediately
          ? null
          : new Date(row.publishTime).getTime() / 1000,
        access_token: process.env.REACT_APP_ACCESS_TOKEN,
      };

      const response = await fetch(
        `https://graph.facebook.com/v20.0/${process.env.REACT_APP_ID}/photos`,
        {
          method: "POST",
          body: JSON.stringify(postData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        results.push({
          date: row.publishImmediately ? new Date() : new Date(row.publishTime),
          success: false,
          data: row,
        });
        failed++;
      } else {
        const responseData = await response.json(); // 获取 JSON 数据
        results.push({
          date: row.publishImmediately ? new Date() : new Date(row.publishTime),
          success: true,
          data: row,
          id: responseData.id,
        });
        success++;
      }
    });

    await Promise.all(promises);
    // displayResults(results);
    alert(
      `總共 ${success} 篇成功排程${
        failed !== 0 ? `, ${failed} 篇排程失敗,請重新嘗試.` : "."
      }`
    );

    const successResult = results.filter((data) => data.success);
    const badResult = results.filter((data) => !data.success);

    setScheduleData(
      Array.from({ length: badResult.length }, (_, index) => {
        return {
          photoUrl: badResult[index].data.photoUrl,
          publishImmediately: badResult[index].data.publishImmediately,
          publishTime: badResult[index].data.publishTime,
          postContent: badResult[index].data.postContent,
        };
      })
    );

    setDay(badResult.length);
    displayResults(successResult);
    setLoading(false);
  };

  const displayResults = (results) => {
    const resultsContainer = document.getElementById("resultsContainer");
    resultsContainer.innerHTML = "";

    results.forEach((result) => {
      const resultElement = document.createElement("div");

      resultElement.textContent = `日期：${result.date.toLocaleString()}, 貼文ID: ${
        result.id
      }`;

      resultsContainer.appendChild(resultElement);
    });
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
            onChange={handleSelectedTimeChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="照片編號"
            type="numeric"
            value={startIndex}
            onChange={handleStartIndexChange}
          />
        </Stack>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">篇數</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={day}
              label="篇數"
              onChange={handleDayChange}
            >
              {Array.from({ length: 30 }, (_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {index + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {loading ? (
          <LoadingButton loading variant="outlined">
            In Progress
          </LoadingButton>
        ) : (
          <Button onClick={() => callAPI()}>一鍵發文</Button>
        )}
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
      <div id="resultsContainer"></div>
    </Container>
  );
};

export default SchedulePage;
