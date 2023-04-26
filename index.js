import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer';

function rename() {
  // 使用 inquirer 获取用户输入
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'dest',
        message: "请输入目录路径（拖动目录即可，绝对路径不能有 '' 号）：",
        validate: function (input) {
          return new Promise(function (resolve, reject) {
            fs.access(input, fs.constants.F_OK | fs.constants.R_OK, function (err) {
              if (err) {
                reject(new Error('🚨目录路径不正确或不可读，请重新输入'));
              } else {
                resolve(true);
              }
            });
          });
        }
      },
      {
        type: 'input',
        name: 'oldName',
        message: '请输入要替换的文件名：',
        validate: function (input) {
          if (!input.length) {
            return '🚨替换的文件名不能为空，请重新输入';
          } else {
            return true;
          }
        }
      },
      {
        type: 'input',
        name: 'newName',
        message: '请输入新的文件名（不填则为空）：'
      },
    ])
    .then(({ dest, oldName, newName }) => {
      // 读取目录下的文件列表
      fs.readdir(dest, { withFileTypes: true }, (err, files) => {
        if (err) {
          console.error('🚨' + err);
          return;
        }
        let renamedFiles = 0; // 记录重命名的文件数量
        // 遍历文件列表，找到需要重命名的文件
        files.forEach((file) => {
          if (file.isFile() && file.name.includes(oldName)) {
            const oldPath = path.join(dest, file.name);
            const newPath = path.join(dest, file.name.replace(oldName, newName));

            try {
              // 重命名文件
              fs.renameSync(oldPath, newPath);
              console.log(`📝 文件 ${file.name} 重命名成功`);
              renamedFiles++;
            } catch (err) {
              console.error(`🚨📝 文件 ${file.name} 重命名失败：${err}`);
            }
          }
        });

        // 输出结果
        if (renamedFiles === 0) {
          console.log('🤖️：当前目录下无法找到要替换的文件名，请检查替换的文件名');
          rename()
        } else {
          console.log('\n🤖️：报告！任务完成！\n');
          console.log(`🎉 ✅ 共重命名 ${renamedFiles} 个文件`);
        }
      });
    });
}

rename()