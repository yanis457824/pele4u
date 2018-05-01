/**
 * Created by User on 25/08/2016.
 */
angular.module('pele')
  //=================================================================
  //==                    PAGE_4
  //=================================================================
  .controller('leadsReportsCtrl', ['StorageService', 'ApiGateway', '$scope', '$state', 'PelApi',
    function(StorageService, ApiGateway, $scope, $state, PelApi) {

      //$ionicHistory.clearHistory();

      $scope.activeGroup = PelApi.sessionStorage.activeAccordionGroup;
      $scope.toggleActive = function(g) {

        if ($scope.activeGroup === g.groupName)
          $scope.activeGroup = ""
        else
          $scope.activeGroup = g.groupName;
        alert($scope.activeGroup + ':' + g.groupName)
        PelApi.sessionStorage.activeAccordionGroup = $scope.activeGroup;

      }

      $scope.type = $state.params.type;

      $scope.createGroups = function() {
        $scope.docsGroups = {};
        if ($state.params.type === "S") {
          $scope.docsGroups['פתוח'] = {
            groupName: "פתוח",
            leads: []
          };
          $scope.leads.forEach(function(l) {
            var leadStatus = _.get(l.ATTRIBUTES, 'lead_status', "פתוח");
            if (typeof $scope.docsGroups[leadStatus] == "undefined")
              $scope.docsGroups[leadStatus] = {
                groupName: leadStatus,
                leads: []
              };
            $scope.docsGroups[leadStatus].leads.push(l)
          })
        } else if ($state.params.type === "T") {

          $scope.leads.forEach(function(l) {
            if (typeof $scope.docsGroups[l.TASK_STATUS] == "undefined")
              $scope.docsGroups[l.TASK_STATUS] = {
                groupName: l.TASK_STATUS,
                leads: []
              };
            $scope.docsGroups[l.TASK_STATUS].leads.push(l)
          })
        }

      }


      $scope.statusClass = {
        'סגור ללא הצלחה': 'string-badge pel-badge pink',
        'טופל בהצלחה': 'string-badge pel-badge green',
        'לקוח לא ענה': 'string-badge pel-badge  light-blue',
        'ממתין למלאי': 'string-badge pel-badge  cyan'
      }
      if ($state.params.type === "S") {
        $scope.title = "לידים שפתחתי";
        $scope.prevState = "app.leads.self"
      } else {
        $scope.title = "לידים שלי";
        $scope.prevState = "app.leads.task"
      }

      $scope.getConf = function() {
        $scope.conf = StorageService.getData("leads_conf")
        if ($scope.conf) return;
        ApiGateway.get("leads/conf").success(function(data) {
          StorageService.set("leads_conf", data, 1000 * 60 * 30)
          $scope.conf = data;
        }).error(function(error, httpStatus, headers, config) {
          ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads/conf   api");
          PelApi.throwError("api", "get Leads conf table", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        })
      }

      $scope.showLead = function(lead) {
        lead.SELF = true;
        $state.go("app.leads.lead", {
          lead: lead
        })
      }
      $scope.getData = function() {
        var service = "leads/";

        if ($state.params.type === "T")
          service += "tasks";

        PelApi.showLoading();
        ApiGateway.get(service, {
          type: $state.params.type
        }).success(function(data) {
          $scope.leads = data;
          $scope.createGroups();
        }).error(function(error, httpStatus, headers, config) {
          ApiGateway.reauthOnForbidden(httpStatus, "Unauthorized get leads  api");
          PelApi.throwError("api", "fetch leads list by type ", "httpStatus : " + httpStatus + " " + JSON.stringify(error))
        }).finally(function() {
          PelApi.hideLoading();
        })
      }

      $scope.getConf();
      $scope.getData();
    }
  ]);