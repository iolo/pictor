var
    fs = require('fs');

var fixtures = module.exports = {
    src_jpg: __dirname + '/test.jpg',
    src_png: __dirname + '/test.png',
    src_gif: __dirname + '/test.gif',
    dst_jpg: '/tmp/pictor_test_dst.jpg',
    dst_png: '/tmp/pictor_test_dst.png',
    dst_gif: '/tmp/pictor_test_dst.gif',
    exist_id: 'exist.txt',
    exist_file: '/tmp/pictor/test/exist.txt',
    exist_file_content: 'show me the money!',
    not_exist_id: 'not_exist.txt',
    not_exist_file: '/tmp/pictor/test/not_exist.txt',
    src_txt: __dirname + '/test.txt',
    dst_txt: '/tmp/pictor_s3_storage_test_dst.txt'
};

module.exports.setupConverterTestFiles = function () {
    fs.existsSync(fixtures.dst_jpg) && fs.unlinkSync(fixtures.dst_jpg);
    fs.existsSync(fixtures.dst_png) && fs.unlinkSync(fixtures.dst_png);
    fs.existsSync(fixtures.dst_gif) && fs.unlinkSync(fixtures.dst_gif);
};

module.exports.setupStorageTestFiles = function () {
    fs.writeFileSync(fixtures.exist_file, fixtures.exist_file_content, 'utf8');
    fs.existsSync(fixtures.not_exist_file) && fs.unlinkSync(fixtures.not_exist_file);
    fs.existsSync(fixtures.dst_txt) && fs.unlinkSync(fixtures.dst_txt);
};
