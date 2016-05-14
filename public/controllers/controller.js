var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$window', '$scope', '$http', function($window, $scope, $http){
    
    socket.on('tweetlist', function(d) {
        $scope.$apply(function() {
            $scope.data = d;
        })
    });
    
    socket.on('test', function(d) {
        $scope.$apply(function() {
            $scope.test = d;
        })
    });
    
    $scope.testSubmit = function() {
        $http.get('/test/' + $scope.test)  
    };
    
    $scope.data = [
            {"user": "user1", "date": "01/01/2016", "count": 0},
            {"user": "user2", "date": "01/01/2016", "count": 0}
        ];
    
    
    $http.get('/tweetlist').
    success(function(response) {
        $scope.data = response;
    }).
    error(function() {
        console.log('error');
    });
    
    $scope.twitterSearch = function(isValid) {
        $scope.fetch = 'Fetching data...';
        $http.delete('/deletetweets')
        .success(function(response) {
            $http.post('/gettweets', {"handle": $scope.compare.handle1, "page": 1})
                .success(function(response){
                    $http.post('/gettweets', {"handle": $scope.compare.handle1, "page": 2})
                        .success(function(response){
                            $http.post('/gettweets', {"handle": $scope.compare.handle1, "page": 3})
                                .success(function(response){
                                    $http.post('/gettweets', {"handle": $scope.compare.handle2, "page": 1})
                                        .success(function(response){
                                            $http.post('/gettweets', {"handle": $scope.compare.handle2, "page": 2})
                                                .success(function(response){
                                                    $http.post('/gettweets', {"handle": $scope.compare.handle2, "page": 3})
                                                        .success(function(response){
                                                            $http.get('/tweetlist')
                                                                .success(function(response) {
                                                                    $scope.data = response;
                                                                    socket.emit('tweetlist', $scope.data);
                                                                    $scope.fetch = '';
                                                                })
                                                                .error(function(response) {
                                                                    $scope.fetch = '';
                                                                    $scope.error = 'Error connecting to database.';
                                                                });
                                                        })
                                                        .error(function(response) {
                                                            $scope.fetch = '';
                                                            $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                                                        });
                                                })
                                                .error(function(response) {
                                                    $scope.fetch = '';
                                                    $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                                                });
                                        })
                                        .error(function(response) {
                                            $scope.fetch = '';
                                            $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                                        });
                                })
                                .error(function(response) {
                                    $scope.fetch = '';
                                    $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                                });
                        })
                        .error(function(response) {
                            $scope.fetch = '';
                            $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                        });
                })
                .error(function(response) {
                    $scope.fetch = '';
                    $scope.error = 'Error connecting to Twitter. Check that the username exists.';
                });
        })
        .error(function(response) {
            $scope.fetch = '';
            $scope.error = 'Error connecting to Twitter. Check that the username exists.';
        });
    };
    
}]);

myApp.directive("chart", function($window, $parse){
    return {
        scope: 'false',
        restrict: "C",
        template: "<svg width='850' height='10'></svg>",
        link: function(scope, elem, attrs) {
 
            
            function getDate(d) {
                return new Date(d);
            }
            
            var data = scope.data;
            
            var margin = {top: 30, right: 20, bottom: 50, left: 50},
                    width = 790 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;
            var xAxis, yAxis;
            var valueline;
            var x, y;
            var parseDate = d3.time.format("%m/%d/%Y").parse;
            
            // Adds the svg canvas
            var svg = d3.select("body")
                .attr("align", "center")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", 
                          "translate(" + margin.left + "," + margin.top + ")");
                          
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(-35," + 210 + ")rotate(-90)")
                .attr("font-weight", "bold")
                .text("Tweets");
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + (width/2) + ", 460)")
                .attr("font-weight", "bold")
                .text("Date");
            var dataGroup;
            
                          
            scope.$watchCollection(attrs.chartData, function(newVal, oldVal) {
                console.log('this executes')
                data = newVal;
                redrawLineChart();
            });
            
            function setChartParameters(){
                dataGroup = d3.nest()
                .key(function(d) {
                    return d.user;
                })
                .entries(data);
                
                // Set the ranges
                x = d3.time.scale().range([0, width]);
                y = d3.scale.linear().range([height, 0]);
                
                // Define the axes
                xAxis = d3.svg.axis().scale(x)
                    .orient("bottom").ticks(5)
                    .tickFormat(d3.time.format('%m/%d/%y'));
                
                yAxis = d3.svg.axis().scale(y)
                    .orient("left").ticks(10);

                // x.domain([getDate("01/01/2012"), getDate(data[data.length-1].date)]);
                x.domain([d3.min(data, function(d) { return getDate(d.date) } ), d3.max(data, function(d) { return getDate(d.date) } )]);
                y.domain([0, d3.max(data, function(d) { return parseInt(d.count); })]);
                
                // Define the line
                valueline = d3.svg.line()
                    .x(function(d) { return x(getDate(d.date)); })
                    .y(function(d) { return y(d.count); })
                    .interpolate("basis");
            }
            
            function drawLineChart() {
                setChartParameters();
                
                // Add the X Axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + height + ")")
                    .call(xAxis);
            
                // Add the Y Axis
                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);
                    
                // Add the valueline path.
                // svg.append("path")
                //     .attr("class", "line")
                //     .attr("d", valueline(data));
                
                dataGroup.forEach(function(d, i) {
                    var lSpace = width/dataGroup.length;
                    svg.append("path")
                        .attr("class", "line" + i)
                        .attr("d", valueline(d.values))
                        .attr("id", "line" + i);
                    
                    svg.append("text")
                        .attr("x", (lSpace / 2) + i * lSpace)
                        .attr("y", 40)
                        .attr("class", "legend" + i)
                        .text(d.key)
                        .on("click", function() {
                            var active = d.active ? false : true;
                            var opacity = active ? 0 : 1;
                            
                            d3.select("#line" + i).style("opacity", opacity);
                            
                            d.active = active;
                        });
                });
            }
            
            function redrawLineChart(){
                setChartParameters();
                  svg.selectAll("g.x.axis").call(xAxis);
    
                  svg.selectAll("g.y.axis").call(yAxis);
    
                //   svg.selectAll(".line")
                //       .attr({
                //           "d": valueline(data)
                //       });
                
                // dataGroup.forEach(function(d, i) {
                //     svg.selectAll(".line")
                //         .attr("d", valueline(d.values));
                // });
                
                dataGroup.forEach(function(d, i) {
                    var lSpace = width/dataGroup.length;
                    
                    svg.selectAll(".line" + i)
                        .attr("d", valueline(d.values))
                        
                    svg.selectAll(".legend" + i)
                        .text(d.key);
                });
            }
            
            
            drawLineChart();
        }
    };
});

angular.module('myApp').factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://0.0.0.0:8080')
        });
    }
]);